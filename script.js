// Code goes here
(function(){
  var app = angular.module('plunker', []);

  app.controller('MainCtrl', function($rootScope, $scope) {
    $scope.tags = [
      { label: "Super Fantastic Sandwiches" },
      { label: "Super Horrible Sandwiches" },
      { label: "Yummy Burgers" },
      { label: "Tastey Apples" },
      { label: "Silly Kids Burgers" },
      { label: "Yum" },
      { label: "Gross" },
      { label: "Whatever" },
      { label: "Food Fight Super Long Title - And more!!!" }
    ];

    $scope.submittedTags = [];

    $scope.submitTags = function(tags) {
      $scope.submittedTags = tags;
    };
  });

  app.directive('tagsInterface', ['$rootScope', '$timeout', '$window', function($rootScope, $timeout, $window){
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'tags-interface.tpl.html',
      scope: {
        tags: '=',
        onSubmit: '='
      },
      link: function(scope, element) {
        var KEY_BACKSPACE = 8;
        var KEY_ENTER = 13;
        var KEY_LEFT = 37;
        var KEY_RIGHT = 39;

        var $tagsWindow = element.find('.tags-window');
        var $tagsSlider = element.find('.tags-slider');
        var $input = element.find('input');

        var totalWidth = 0;
        var tagsWindowMaxWidth = 0;
        var desiredWidth = 0;

        scope.newTagLabel = '';
        scope.cursorPosition = scope.tags.length;

        scope.hasTags = function() {
          return scope.tags.length > 0;
        };

        scope.removeTag = function($index) {
          scope.tags = _.filter(scope.tags, function(item, index) {
            return index !== $index;
          });

          scope.calcTagContainerWidth(element);
        };

        scope.keypress = function(e) {
          var key = e.which;

          switch (key) {
            case KEY_ENTER:
              return enter();
            case KEY_BACKSPACE:
              return backspace();
            case KEY_LEFT:
              return moveCursor(-1);
            case KEY_RIGHT:
              return moveCursor(1);
            default:
              setCursor(scope.tags.length);
          }
        };

        var addTag = function() {
          scope.tags.push(createTag(scope.newTagLabel, '0'));
          scope.newTagLabel = '';
          scope.cursorPosition = scope.tags.length;

          scope.calcTagContainerWidth(element);
        };

        var enter = function() {
          if (scope.newTagLabel.length === 0 && scope.tags.length > 0) {
            scope.onSubmit(scope.tags);
          } else if (scope.newTagLabel.length > 0 ) {
            addTag();
          }
        };

        var backspace = function() {
          if (scope.cursorPosition < scope.tags.length) {
            scope.removeTag(scope.cursorPosition);
          } else {
            if (scope.newTagLabel.length === 0) {
              removeHeadTag();
            }
          }
        };

        var moveCursor = function(delta) {
          var newPosition = scope.cursorPosition;
          newPosition += delta;
          newPosition = Math.min(newPosition, scope.tags.length);
          newPosition = Math.max(newPosition, 0);

          setCursor(newPosition);
        };

        var setCursor = function(newPosition) {
          scope.cursorPosition = newPosition;
          scrollTags();
        };

        var removeHeadTag = function() {
          if (scope.tags.length > 0) {
            scope.removeTag(scope.tags.length - 1);
            scope.cursorPosition = scope.tags.length;
          }
        };

        var createTag = function(label, value) {
          return {
            label: label,
            searchValue: value
          };
        };

        var scrollTags = function() {
          var scroll = 0;

          if (scope.cursorPosition < scope.tags.length) {
            var selectedEl = scope.tagElements[scope.cursorPosition];
            var selectedLeft = $(selectedEl).position().left;
            var offset = desiredWidth - selectedLeft;
            var availableWidth = $tagsWindow.width();
            var delta = availableWidth - offset;

            if (delta < 0) {
              scroll = delta;
            }
          }

          $tagsSlider.css({right: scroll + 'px'});
        };

        scope.calcTagContainerWidth = function(element) {
          totalWidth = element.width();
          tagsWindowMaxWidth = totalWidth / 2.0;
          desiredWidth = 0;

          var tagElements = element.find('.tag');
          var tagMaxWidth = Math.floor(tagsWindowMaxWidth * 0.35);
          var inputWidth = 0;

          scope.tagElements = tagElements;

          // disabled for now, truncated titles are not desired
          // var sizeTag = function($el) {
          //   // var $control = $el.find('.control');
          //   // var tagWidth = $el.width();
          //   // var controlWidth = $control.outerWidth() + 3;
          //   // $el.find('.display').outerWidth(tagWidth - controlWidth);
          // };

          // tagElements.each(function(index, el) {
          //   var $el = $(el);
          //   // $el.css({width: 'auto', maxWidth: tagMaxWidth + 'px'});

          //   $timeout(function() {
          //     sizeTag($el);
          //   }, 1);
          // });

          return $timeout(function() {
            desiredWidth = $tagsSlider.outerWidth();

            var w = Math.min(tagsWindowMaxWidth, desiredWidth);
            $tagsWindow.outerWidth(w);

            inputWidth = element.width() - $tagsWindow.outerWidth();
            $input.outerWidth(inputWidth);
          }, 2);
        };

        // init
        angular.element($window).bind('resize', function() {
          scope.calcTagContainerWidth(element).then(scrollTags);
        });

        $timeout(function() {
          scope.calcTagContainerWidth(element);
        }, 10);
      }
    };
  }]);
})();