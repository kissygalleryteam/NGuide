/**
 * @fileoverview 请修改组件描述
 * @author Letao<mailzwj@126.com>
 * @module NGuide
 **/
KISSY.config({
    packages: [{
        name: "gallery/offline/1.1/index",
        path: "http://a.tbcdn.cn/s/kissy/",
        charset: "utf-8"
    }]
});
KISSY.add(function (S, Node, Base, Xtpl, Offline) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 请修改组件描述
     * @class NGuide
     * @constructor
     * @extends Base
     */

    NGuide.TEMPLATE = {
        overlay: '{{#if data}}{{#data}}'
            + '<div class="NG-Content clearfix">'
            + '<span class="NG-stepNumber">{{step}}</span>'
            + '<div class="NG-body">'
            + '{{#if title}}<h2 class="NG-Guide-title">{{title}}</h2>{{/if}}'
            + '{{#if content}}<div class="NG-Guide-content">{{content}}</div>{{/if}}'
            + '</div>'
            + '<div class="NG-Guide-Actions">{{{actions}}}</div>'
            + '</div>'
            + '<div class="NG-Arrow">'
            + '<span class="border-arrow border-arrow-down"></span>'
            + '<span class="border-arrow border-arrow-up"></span>'
            + '</div>'
            + '{{/data}}{{/if}}'
            + '<a class="NG-Guide-Close" href="javascript:void(0);" title="关闭"></a>',
        prev: '<input type="button" class="NG-btn NG-btn-prev" value="上一个">',
        next: '<input type="button" class="NG-btn NG-btn-next" value="下一个">',
        done: '<input type="button" class="NG-btn NG-btn-done" value="完成">',
        skip: '<input type="button" class="NG-btn NG-btn-skip" value="跳过">'
    };

    function NGuide(cfg) {
        var self = this;
        //调用父类构造函数
        NGuide.superclass.constructor.call(self, cfg);
        self.offline = new Offline();
        self.tpl = NGuide.TEMPLATE.overlay;
        self.id = cfg.id || "ng-index";
        self.skin = cfg.skin || "default";
        self.arrowSize = cfg.arrowSize || 15;
        self.auto = cfg.auto;
        self.trigger = S.all(cfg.trigger);
        self.steps = cfg.steps || [];
        self.stateId = "ks-state-step-" + self.id;
        self.ng = S.one(".NG-Guide");
        if (!self.ng) {
            self.ng = S.one(S.DOM.create('<div class="NG-Guide"></div>'));
            S.one("body").append(self.ng);
        }
        self.defaultWidth = self.ng.width();
        self.curStep = 1;
        self.animDist = 80; // 动画移动距离
        self.topDist = 100; // 窗口需滚动时，浮层距离窗口顶部的距离
        //console.log(new Xtpl(self.tpl).render({"data": cfg.steps[0]}));
        if (self.auto) {
            self.init();
        } else {
            self._bindEvent();
        }
    }
    S.extend(NGuide, Base, /** @lends NGuide.prototype*/{
        _bindEvent: function() {
            var self = this;
            self.trigger.on("click", function(e){
                self.init();
                e.preventDefault();
            });
        },
        _setItem: function(step) {
            var self = this;
            self.offline.setItem(self.stateId, self.id + ":" + step);
        },
        _delegateAction: function() {
            var self = this;
            self.ng.delegate("click", ".NG-btn-prev", function(e){
                self.gotoStep(--self.curStep);
                self._setItem(self.curStep);
                e.preventDefault();
            });
            self.ng.delegate("click", ".NG-btn-next", function(e){
                self.gotoStep(++self.curStep);
                self._setItem(self.curStep);
                e.preventDefault();
            });
            self.ng.delegate("click", ".NG-btn-skip", function(e){
                self._setItem("off");
                self.destory();
                e.preventDefault();
            });
            self.ng.delegate("click", ".NG-btn-done", function(e){
                self._setItem("off");
                self.destory();
                e.preventDefault();
            });
            self.ng.delegate("click", ".NG-Guide-Close", function(e){
                self.hide();
                e.preventDefault();
            });
        },
        _getPosition: function(step) {
            var self = this,
                sd = self.steps[step - 1],
                tar = S.one(sd.target);
            var tPos = tar.offset(),
                tSize = {width: tar.outerWidth(), height: tar.outerHeight()},
                ngSize = {width: self.ng.outerWidth(), height: self.ng.outerHeight()};
            var outPos = {left: 0, top: 0};
            sd.offsetX = sd.offsetX ? sd.offsetX : 0;
            sd.offsetY = sd.offsetY ? sd.offsetY : 0;
            switch(sd.placement) {
                // case "left": {
                //     outPos.left = tPos.left + tSize.width + sd.offsetX + self.arrowSize;
                //     outPos.top = tPos.top + sd.offsetY;
                //     break;
                // }
                case "right": {
                    outPos.left = tPos.left + tSize.width + sd.offsetX + self.arrowSize;
                    outPos.top = tPos.top + sd.offsetY;
                    break;
                }
                case "top": {
                    outPos.left = tPos.left + sd.offsetX;
                    outPos.top = tPos.top - ngSize.height - sd.offsetY - self.arrowSize;
                    break;
                }
                case "bottom": {
                    outPos.left = tPos.left + sd.offsetX;
                    outPos.top = tPos.top + tSize.height + sd.offsetY + self.arrowSize;
                    break;
                }
                default: {
                    outPos.left = tPos.left - ngSize.width - self.arrowSize - sd.offsetX;
                    outPos.top = tPos.top + sd.offsetY;
                    break;
                }
            }
            return outPos;
        },
        _setArrowPosition: function(step) {
            var self = this;
            var sd = self.steps[step - 1];
            var arrow = self.ng.one(".NG-Arrow");
            // sd.arrowOffset = sd.arrowOffset ? sd.arrowOffset : 0;
            if (sd.arrowOffset) {
                switch(sd.placement) {
                    // case "left": {
                    //     arrow.css("top", sd.arrowOffset);
                    //     break;
                    // }
                    case "right": {
                        arrow.css("top", sd.arrowOffset);
                        break;
                    }
                    case "top": {
                        arrow.css("left", sd.arrowOffset);
                        break;
                    }
                    case "bottom": {
                        arrow.css("left", sd.arrowOffset);
                        break;
                    }
                    default: {
                        arrow.css("top", sd.arrowOffset);
                        break;
                    }
                }
            }
        },
        _setNgWidth: function(step) {
            var self = this;
            var sd = self.steps[step - 1];
            var rPlace = /(^|\s+)NG\-Guide\-\w+(\s|$)/g;
            var clsStr = self.ng.attr("class");
            sd.placement = sd.placement ? sd.placement : "left";
            if (sd.width) {
                self.ng.css("width", sd.width);
            } else {
                self.ng.css("width", self.defaultWidth);
            }
            if (clsStr.match(rPlace)) {
                self.ng.attr("class", clsStr.replace(rPlace, "$1NG-Guide-" + sd.placement + "$2"));
            } else {
                self.ng.addClass("NG-Guide-" + sd.placement);
            }
        },
        _scrollWindow: function(dest, step, callback) {
            var self = this;
            var win = S.one(window);
            var scrt = win.scrollTop();
            var winSize = {width: win.outerWidth(), height: win.outerHeight()};
            var ngSize = {width: self.ng.outerWidth(), height: self.ng.outerHeight()};
            if (dest.top - self.topDist < 0) {
                win.animate({"scrollTop": (dest.top - self.topDist > 0 ? dest.top : 0)}, 0.5, "easeOut", function(){
                    callback && callback();
                });
            } else if (dest.top + ngSize.height + self.topDist > scrt + winSize.height) {
                win.animate({"scrollTop": dest.top + ngSize.height + self.topDist - winSize.height}, 0.5, "easeOut", function(){
                    callback && callback();
                });
            } else {
                callback && callback();
            }
        },
        _moveToTarget: function(dest, step) {
            var self = this;
            var sd = self.steps[step - 1];
            var animProp = {left: dest.left, top: dest.top};
            switch(sd.placement) {
                // case "left": {
                //     animProp.left = dest.left - self.animDist;
                //     break;
                // }
                case "right": {
                    animProp.left = dest.left + self.animDist;
                    break;
                }
                case "top": {
                    animProp.top = dest.top - self.animDist;
                    break;
                }
                case "bottom": {
                    animProp.top = dest.top + self.animDist / 2;
                    break;
                }
                default: {
                    animProp.left = dest.left - self.animDist / 2;
                    break;
                }
            }
            self.ng.css({"opacity": 0, "top": animProp.top, "left": animProp.left});
            self.ng.show();
            dest.opacity = 1;
            self._scrollWindow(dest, step, function(){
                self.ng.animate(dest, 0.5, "easeOut", function(){
                    //console.log("done");
                    self.fire("stepChange");
                });
            });
        },
        init: function() {
            var self = this;
            if (self.steps.length <= 0) {
                self.destory();
                return;
            }
            var cs = self.offline.getItem(self.stateId);
            if (cs) {
                var cstep = cs.split(":")[1];
                if (isNaN(parseInt(cstep))) {
                    self.destory();
                    return;
                } else {
                    self.curStep = parseInt(cstep);
                    self.gotoStep(self.curStep);
                }
            } else {
                self.gotoStep(self.curStep);
                self._setItem(self.curStep);
            }
            
            self.setSkin(self.skin);
            self._delegateAction();
        },
        setSkin: function(skin) {
            var self = this;
            var skinCls = "";
            var rCls = null;
            var gdClass = self.ng.attr("class");
            if (skin) {
                skinCls += "NG-Skin-" + self.steps[self.curStep - 1].placement + "-" + skin;
                rCls = new RegExp("(^|\\s+)NG-Skin-(\\w+)-\\w+(\\s+|$)", "g");
                if (rCls.test(gdClass)) {
                    gdClass = gdClass.replace(rCls, "$1" + skinCls + "$3");
                    self.ng.attr("class", gdClass);
                } else {
                    self.ng.addClass(skinCls);
                }
            } else {
                self.ng.attr("class", gdClass.replace(new RegExp("(^|\\s+)NG-Skin-(\\w+)-\\w+(\\s+|$)", "g"), ""));
            }
            self.skin = skin;
        },
        gotoStep: function(step) {
            var self = this;
            //console.log(step,new Xtpl(self.tpl).render({"data": self.steps[step - 1]}));
            var sl = self.steps.length;
            if (sl < 1 || step > sl) {
                S.log("Something is wrong.");
                return false;
            }
            var acs = NGuide.TEMPLATE.prev + NGuide.TEMPLATE.next + NGuide.TEMPLATE.skip;
            var renderData = {"data": self.steps[step - 1]};
            if (step === 1) {
                acs = NGuide.TEMPLATE.next + NGuide.TEMPLATE.skip;
            } else if (step === sl) {
                acs = NGuide.TEMPLATE.prev + NGuide.TEMPLATE.done;
            }
            // console.log(step);
            if (sl === 1) {
                acs = NGuide.TEMPLATE.done;
            }
            renderData.data.actions = acs;
            renderData.data.step = step;
            var tour = new Xtpl(self.tpl).render(renderData);
            self.ng.html(tour);
            self._setNgWidth(step);
            self._setArrowPosition(step);
            var pos = self._getPosition(step);
            //self.ng.css({"display": "block", "top": pos.top, "left": pos.left});
            var offstate = self.offline.getItem(self.stateId);
            self._moveToTarget(pos, step);
            if (offstate && offstate.split(":")[1] !== "off") {
                self._setItem(step);
                self.curStep = step;
            }
            self.setSkin(self.skin);
        },
        destory: function() {
            var self = this;
            self.ng.remove();
        },
        hide: function() {
            var self = this;
            self.ng.hide();
        },
        reset: function() {
            var self = this;
            // self.offline.clear();
            self.offline.removeItem(self.stateId);
        },
        getStep: function() {
            var self = this;
            var step = self.offline.getItem(self.stateId);
            return (step && step.split(":")[1]) ? parseInt(step.split(":")[1]) : -1;
        }
    }, {ATTRS : /** @lends NGuide*/{

    }});
    return NGuide;
}, {requires:['node', 'base', "xtemplate", "gallery/offline/1.1/index"]});



