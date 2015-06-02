/**
 * Favorite Class
 */

var Favorite = (function() {

    var Favorite = function(options) {
        // NIFTY Cloud mobile backend javascript SDKの初期化
        NCMB.initialize(options.applicationKey, options.clientKey);
    
        // mobile backend上のFavoriteクラスを表すオブジェクト
        this.FavoriteObject = NCMB.Object.extend("Favorite");
    
        // 記事リストを指定するためのID
        this.listEl = "#feed-list";
    
        // アプリ+端末を特定するためのuuidを取得
        // uuidはアプリアンインストールで削除されます
        this.uuid = localStorage.getItem('uuid');
        if (this.uuid === null) {
          // uuid未生成の場合は新規に作る
          this.uuid = NCMB._createUuid(); // SDK内部メソッドを拝借
          localStorage.setItem('uuid', this.uuid);
        }
    
        if (options) {
          $.extend(this, options);
        }
    
        this.addClickHandler();
    };
  
    // お気に入りの追加処理
    Favorite.prototype.add = function(item) {
        var self = this;
        var url = item.data('link');
    
        var favorite = new this.FavoriteObject();
        favorite.set('uuid', self.uuid);
        favorite.set('url', url);
        favorite.save(null, {
            success: function(favorite) {
                self.apply(item);
            },
            error: function(favorite) {
                self.apply(item);
            }
        });
    };
  
    // お気に入りの削除
    Favorite.prototype.remove = function(item) {
        var self = this;
        var url = item.data('link');
    
        // 条件にマッチするデータを削除する（最大100件）
        var query = new NCMB.Query(this.FavoriteObject);
        query.equalTo('uuid', self.uuid);
        query.equalTo('url', url);
        query.find({
            success: function(results) {
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    object.destroy();
                }
                self.apply(item);
            },
            error: function(error) {
                self.apply(item);
            }
        });
    }
  
    // 全ての記事に対してお気に入り状況を反映させる
    Favorite.prototype.applyAll = function() {
        var self = this;
        $(this.listEl).children('li').each(function(index) {
            var item = $(this);
            self.apply(item);
        });
    };
  
    // 指定した記事に対してお気に入り状況を反映させる
    Favorite.prototype.apply = function(item) {
        var self = this;
        var url = item.data('link');
        
        // お気に入り数を取得して更新
        var query_count = new NCMB.Query(self.FavoriteObject);
        query_count.equalTo('url', url);
        query_count.count({
            success: function(count) {
                var icon = item.children('i');
                icon.text(count);
            },
            error: function(error) {
                var icon = item.children('i');
                icon.text('');
                console.log('favorite count error: ' + error.message);
            }
        });
      
        // 自分がお気に入りしているかどうかを取得して更新
        var query_check = new NCMB.Query(self.FavoriteObject);
        query_check.equalTo('uuid', self.uuid);
        query_check.equalTo('url', url);
        query_check.count({
            success: function(count) {
                var icon = item.children('i');
                if (count > 0) {
                    icon.addClass('fa-star');
                    icon.removeClass('fa-star-o');
                } else {
                    icon.removeClass('fa-star');
                    icon.addClass('fa-star-o');
                }
            },
            error: function(error) {
                console.log('own favorite check error: ' + error.message);
            }
        });
    };
    
    // お気に入りのOn/Offイベント時の処理
    Favorite.prototype.addClickHandler = function() {
        var self = this;
          
        $(this.listEl).on('click', '.star', function(event) {
            if ($(this).hasClass('fa-star-o')) {
                self.add($(this).closest('li'));
            } else {
                self.remove($(this).closest('li'));
            }
            event.stopPropagation();
        });
    };
  
    return Favorite;
})();