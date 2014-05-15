// node modules
var fs, path, cp, gui;
fs = require("fs");
path = require("path");
gui = require('nw.gui');

(function(){
    window.App = Backbone.Model.extend({
      initialize: function(){
        console.log(this);
        console.log("Hello YAFB");
      },
      open: function(p){
        this.view.$el.children().remove();
        var fileView;
        fileView = new App.FileView({
          model: new App.File({
            name : path.basename(p),
            path : path.resolve(p)
          })
        });
        this.view.$el.append(fileView.render().el);
      }
    });
    App.View = Backbone.View.extend({
      el: $("#app")
    });
    $("#file-input-button").on("click", function(e){
      $fi = $("#file-input");
      $fi.on("change", function(e){
        var path = $(this).val();
        console.log(path);
        app.open(path);
      });
      $("#file-input").trigger("click");
    });
    App.File = Backbone.Model.extend({
      initialize: function() {
      },
      isDirectory: function(){
        if (this._isDirectory === void 0) {
          return (this._isDirectory = fs.lstatSync(this.get("path")).isDirectory());
        }
        return this._isDirectory;
      },
      isImage: function(){
        if (this._isImage === void 0){
          return (this._isImage = !!path.extname(this.get("name")).match(/(jpg|png|gif/));
        }
        return this._isImage;
      },
      getClasses: function(){
        return this.isDirectory() ? "directory-item" : "file-item";
      },
      getDisplayName: function(){
        return this.isDirectory() ? "[ " + this.get("name") + " ]" : this.get("name");
      }
    });
    App.FileView = Backbone.View.extend({
      tagName: "li",
      template: _.template($("#file-view-template").text()),
      events: {
        "click": "onClick"
      },
      onClick: function(e){
        e.preventDefault();
        e.stopPropagation();
        if (this.model.isDirectory()) {
          this.toggle();
        }else{
          // open in other application
          gui.Shell.openItem(this.model.get("path"));
        }
      },
      expand: function(){
        if (!this.model.isDirectory()) return;
        var self = this;
        fs.readdir(path.resolve(this.model.get("path")), function(e, files) {
          console.log(files);
          var $ul, df, file, fileView;
          $ul = $("<ul class=\"children\"></ul>");
          df = document.createDocumentFragment();
          _.chain(files)
            .filter(function(f){return f.charAt(0) !== "."})
            .each(function(f){
              fileView = new App.FileView({
                model : new App.File({
                  "name": f,
                  "path": path.resolve(self.model.get('path') + "/" + f)
                })
              });
              df.appendChild(fileView.render().el);
            })
          $ul.append(df);
          self.$el.append($ul);
          self.$children = $ul;
          self.expanding = true;
        });
      },
      collapase: function(){
        if (!this.model.isDirectory()) return;
        this.$children.remove();
        this.expanding = false;
      },
      toggle: function(){
        this.expanding ? this.collapase() : this.expand();
      },
      render: function(){
        this.$el.html(this.template(this.model));
        return this;
      }
    });
  // initialize
  window.app = new App;
  app.view = new App.View({
    model: app
  });
}).call(this);