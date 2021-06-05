(function ($, factory, pluginName) {

  factory($, pluginName);

})(jQuery, function ($, pluginName) {

  //插件默认配置项
  var __DEFAULT__ = {

    //默认触发验证的事件为input事件
    initEvent: 'input',
    prefix: 'vt' //自定义属性前缀
  };

  //插件内部编写校验规则
  var __RULES__ = {

    //正则
    regexp: function (ruleData) {
      return new RegExp(ruleData).test(this.val());
    },

    //必填项
    required: function (ruleData) {
      return $.trim(this.val()).length > 0;
    },

    //最小值
    minLength: function (ruleData) {
      return $.trim(this.val()).length > ruleData;
    },

    //最大值
    maxLength: function (ruleData) {
      return $.trim(this.val()).length < ruleData;
    },

    //验证两次密码是否一致
    isEquals: function (ruleData) {
      var pwd = $(':password').eq(0); //$(':password')[0]是什么对象呢？
      return pwd.val() === this.val();
    },

    //是否是邮箱
    isEmail: function (ruleData) {
      return /\w+@\w+\..+/g.test(this.val());
    },

    //是不是手机号
    isPhone: function (ruleData) {
      return /^1\d{10}$/g.test(this.val());
    },

    //是不是座机号码
    isTel: function (ruleData) {
      return /^0\d{2,3}-\d{7,8}$/g.test(this.val());
    }
  };

  $.fn[pluginName] = function (options) {

    //标识是否提交表单
    var $this = this;

    if (!$this.is('form')) {
      return;
    }

    //this: 这里的this是jQuery实例对象
    $this.$file = $this.find('input:not([type="button"][type="submit"])'); //给当前实例对象(也就是调用该插件的jquery对象)添加一个$file的属性

    $.extend($this, __DEFAULT__, options); //以默认配置为优先，以用户配置为覆盖

    //格式化rule规则。
    // 将一个字符串在每一个大写字母前加上一个'-',并且全部转为小写
    // vtEmailMsg > vt-email-msg
    $this.formatRule = function (str, connector) {

      if (typeof str !== 'string') {
        return str;
      }

      //使用replace、正则(匹配单个大写字母)
      str = str.replace(/[A-Z]/g, function (match, index) {
        if (index === 0) {
          return match.toLowerCase()
        }
        return connector + match.toLowerCase();
      });
      return str;
    };

    //显示错误信息
    $this.showErrorTip = function (errorMsg) {
      var $tip = $("<div class='validate-error-tip'> </div>"),
        offset = this.position(),
        elHeight = this.outerHeight(),
        elWidth = this.outerWidth();

      if (this.siblings('.validate-error-tip').length > 0) {
        this.siblings('.validate-error-tip').eq(0).text(errorMsg).show();
      } else {
        $tip.text(errorMsg).
        css({
          top: offset.top,
          left: offset.left + elWidth + 15,
          width: $tip.width()
        });
        this.after($tip);
        $tip.show();
      }
    };

    //监听form表单里所有的input的事件
    $this.$file.on(this.initEvent, function () {

      var $input = $(this);

      //清除错误提示框
      $input.siblings('.validate-error-tip').remove();

      //注意这里是循环的我们插件的规则，而不是用户拥有的规则
      $.each(__RULES__, function (key, fn) {
        var rule = '',
          errorMsg = '';

        //如果key是以is字符开头、则去掉is
        if (key.indexOf('is') === 0) {
          key = key.slice(2);
        }

        key = $this.formatRule(key, '-'); //将规则格式化为html中书写的形式
        rule = $input.data(__DEFAULT__.prefix + '-' + key); //获取规则的值
        errorMsg = $input.data(__DEFAULT__.prefix + '-' + key + '-msg'); //规则对应的提示信息

        //如果当前input有这个规则，则执行这个规则
        if (rule) {

          //执行规则测试是否通过
          var isPassed = fn.call($input, rule); //改变规则函数fn执行时候的this，指向当前input jquery对象

          if (!isPassed) {
            //未通过、则错误提示
            $this.showErrorTip.call($input, errorMsg);
          }
        }
      });
    });

    //绑定提交表单的事件
    this.on('submit', function (e) {
      var isFormPassed = true;

      $this.$file.trigger($this.initEvent);

      $this.$file.each(function (index, current) {
        var $current = $(current);

        if ($current.siblings('.validate-error-tip').is(':visible')) {
          isFormPassed = false;
          return false;
        }

      });

      if (!isFormPassed) {
        return isFormPassed;
      }
    });
  };

  //扩展新的验证规则(实际上就是扩展上面__RULES__对象)
  $.fn[pluginName].addRule = function (options) {

    $.extend(__RULES__, options);
  }
}, 'formValidate');