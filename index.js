var $ = require('jquery'),
    Eventor = require('eventor');
require('./css/editor.css');
require('./css/style.css');
function Editor(obj) {
    this.option = obj;
};

Eventor.mixTo(Editor);

var proto = Editor.prototype;
proto.render = function() {
    var obj = this.option;
    var _this = this;
    this.idFir = $(obj['target']).eq(0);
    this.textareaName = obj['textareaName'];
    this.num = obj['num'] || '';
    this.saveName = !!obj['saveName'] ? obj['saveName'] : false;
    this.saveCon = 'editor' + this.num;
    this.saveTime = !!obj['saveTime'] ? obj['saveTime'] : 5000;
    // this.editorHeight = !!obj['height'] ? obj['height'] : "500px";
    this.autoSave = !!obj['autoSave'] ? obj['autoSave'] : true;
    if (this.idFir.length == 0) {
        console.warn("target not find");
        return;
    }
    this.filter = obj['filter'] != undefined ? obj['filter'].split(",") : false;
    this.firName = obj['target'].replace(/[.|#]/, "");
    this.conWarp = '<div class="e-editor"></div>',
    this.contain = '<iframe class="editor"  width="100%"  frameborder="0" name="' + this.saveCon + '" ></iframe>'; //allowTransparency="true"
    this.selecte = 'e-selected';
    this.idFir.append(this.conWarp);
    this.idFir.find(".e-editor").append(this.contain);
    this.idEditor = this.idFir.find("iframe")[0]; //document.getElementById('editor');
    this.idEditorWin = this.idEditor.contentWindow;
    this.setEditor = !document.selection ? this.idEditorWin.document : this.idEditor.contentWindow.document;
    this.ifrObj = this.idEditor.contentDocument || this.idEditor.contentWindow.document;
    this.rangeText = '';
    this.maxHeight = '';
    this.rangeIe = '';
    this.text = '';
    _this.isIE11 = false;
    _this.ie = false;
    _this.menuStu = true;
    this.ieSelectionBookMark = null;
    this.browser = navigator.appName;
    this.b_version = navigator.appVersion;
    this.version = this.b_version.split(";");
    this.trim_Version = this.browser == "Microsoft Internet Explorer" ? this.version[1].replace(/[ ]/g, "") : this.version[0].replace(/[ ]/g, "");
    this.isIE = navigator.userAgent.search(/Trident/i);
    if (this.browser == "Microsoft Internet Explorer" && this.trim_Version == "MSIE7.0" || this.trim_Version == "MSIE8.0" || this.trim_Version == "MSIE9.0" || this.trim_Version == "MSIE10.0") {
        _this.ie = true;
    } else {
        _this.isIE11 = navigator.userAgent.search(/Trident/i) > 0 ? true : false;
    }
    this.init();
    this.menu();

    if (this.idFir.length == 1) {
        this.getLastFocus();
    }

    this.idFir.find("iframe").contents().find("body").on('click', function() {
        _this.getFocus();
        if (_this.idFir.find('.smilies-box').is(":visible")) {
            _this.idFir.find('.smilies-box').hide();
        } else if (_this.idFir.find('.pop-at').is(":visible")) {
            _this.idFir.find('.pop-at').hide();
        }
    });
    this.idFir.find("iframe").contents().find("body").on('focus', function() {
        _this.getSelpor();
    });

    this.idFir.find("iframe").contents().find("body").on('blur', function() {
        _this.getBlur();
    });

    //判断内容初始化时有没有内容，有=》不显示背景提示，否=》显示背景提示  
    var htmlTag = $.trim(this.idFir.find("iframe").contents().find("body").html());
    var html = htmlTag.replace(/<\/?[^>]*>/g, '');
    html = html.replace(/[ | ]*\n/g, '\n');
    html = html.replace(/&nbsp;/ig, '');
    if (html == '' && /<img/.test(htmlTag) == false) {
        this.idFir.find("iframe").contents().find("body").removeClass("not-bg");
    } else {
        this.idFir.find("iframe").contents().find("body").addClass("not-bg");
    }
    _this.emit('init', _this);
    return _this;
};
//焦点停留最后
proto.getLastFocus = function() {
    var _this = this;
    var el = _this.setEditor;

    $('.' + _this.selecte).removeClass(_this.selecte);
    _this.idFir.addClass(_this.selecte);
    _this.idFir.find(".smilies-box").hide();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        el.body.focus();
        range.selectNodeContents(el.body);
        range.collapse(false);
        var sel = _this.setEditor.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = _this.idEditorWin.document.body.createTextRange();
        textRange.moveToElementText(el.body);
        textRange.collapse(false);
        textRange.select();
        _this.getFocus();
    }
}
//IE选区保存
proto.getSelpor = function() {
    var _this = this;
    if (_this.ie == true) {
        var range = _this.setEditor.selection.createRange();
        _this.rangeText = range.text;
        _this.ieSelectionBookMark = range.getBookmark();
    } else if (_this.isIE11 == true) {
        _this.rangeIe = '';
        _this.rangeIe = _this.setEditor.getSelection().getRangeAt(0);
    }
}
//IE选区恢复
proto.setSelpor = function() {
    var _this = this;
    if (_this.ie == true) {
        _this.getFocus();
        if (_this.ieSelectionBookMark) {
            var range = _this.setEditor.selection.createRange();
            range.moveToBookmark(_this.ieSelectionBookMark);
            range.select();
        }
    }
}
//换行时保存光标位置
proto.keyPress = function(event) {
    var _this = this;
    if ($.trim($(this).find("body").html()) == '' && /<img/.test($(this).find("body").html()) == false) {
        $(this).find("body").removeClass("not-bg");
    } else {
        $(this).find("body").addClass("not-bg");
    }
    if (event.keyCode == 13) {
        if (_this.ie == true) {
            var range = _this.setEditor.selection.createRange();
            _this.rangeText = range.text;;
            _this.ieSelectionBookMark = range.getBookmark();
        } else if (_this.isIE11 == true) {
            _this.rangeIe = '';
            _this.rangeIe = _this.setEditor.getSelection().getRangeAt(0);
        }
    }
}
proto.init = function() {
    var _this = this;

    //开启编辑模式
    this.setEditor.designMode = "on";
    this.idEditor.contentEditable = true;

    this.setEditor.open();
    this.setEditor.writeln('<html><body></body></html>');
    this.setEditor.close();

    var fileref = _this.idEditor.contentWindow.document.createElement("link");
    fileref.rel = "stylesheet";
    fileref.type = "text/css";
    fileref.href = 'http://source.csf.bzdev.net/bbs/css/editor/style.css?8';
    fileref.media = "screen";
    var headobj = _this.idEditorWin.document.getElementsByTagName('head')[0];
    console.log(headobj)
    headobj.appendChild(fileref);

    //自动保存
    if (_this.autoSave == 'true') {

        _this.interval = setTimeout(function() {
            _this.save();

        }, _this.saveTime)
    }
    //获取草稿
    function getSave() {

        var storage = window.localStorage || false;
        if (storage != false) {
            for (var i = 0; i < window.localStorage.length; i++) {
                var name = _this.saveCon;
                _this.idEditorWin.document.body.innerHTML = storage.getItem(name);
                if (_this.saveName != false && _this.num == '') {

                    var otherName = _this.saveName;
                    $('input[name=' + _this.saveName + ']').val(storage.getItem(otherName))
                }
            }
        }
    }
    //获取ifr高度
    function handleIframeKeyUp(e) {
        if (!this.trim_Version == "MSIE10.0") {
            var height = this.idEditor.contentDocument.body.scrollHeight; //scrollHeight//offsetHeight;
            if (height >= 800) {
                this.idEditor.height = '800px';
            } else if (h > parseInt(idEditor.height)) {
                this.idEditor.height = h + "px";
            }
        }
    }

    //用户输入监听
    if (typeof this.ifrObj.addEventListener != "undefined") {
        this.ifrObj.addEventListener("keyup", this.keyPress, false);
    } else if (typeof this.ifrObj.attachEvent != "undefined") {
        this.ifrObj.attachEvent("onkeyup", this.keyPress);
    }
    getSave();
}

//菜单输出
proto.menu = function(stu) {
    var _this = this;
    var contorlBar = '<div class="editor-contorl"></div>';
    var contorFont = '<span class="e-mutual"></span><span  class="e-set-font-contorl contorl-a" title="展开字体设置">T</span><span class="e-set-font"></span>';
    var overlayou = '<div class="e-overlayou"></div>';
    var redoHtml = '<div class="e-textarea e-text-' + _this.firName + '"><textarea></textarea></div>';
    //HTML输出

    if (!$("div").hasClass("e-overlayou")) {
        $("body").append(overlayou);
    }

    var menuHtml = [{
            type: 'btnFont',
            val: [{
                name: "fontname",
                text: '<a href="javascript:;" class="contorl-a contorl-fontname contorl-a-subnav " data-type="fontname"><span title="设置字体" class="contorl-txt">宋体</span>' +
                    '<ul class="e-sub-list">' +
                    '<li data-value="宋体" class="e-f-SimSun">宋体</li>' +
                    '<li data-value="微软雅黑" class="e-f-Microsoft-YaHei">微软雅黑</li>' +
                    '<li data-value="黑体" class="e-c-SimHei">黑体</li>' +
                    '<li data-value="黑体" class="e-c-Arial">Arial</li>' +
                    '</ul></a>'
            }, {
                name: "fontSize",
                text: '<a href="javascript:;" class="contorl-a contorl-size contorl-a-subnav" data-type="fontSize"><span title="设置字体大小" class="contorl-txt">小</span>' +
                    '<ul class="e-sub-list">' +
                    '<li data-value="3">小</li>' +
                    '<li data-value="6">中</li>' +
                    '<li data-value="8">大</li>' +
                    '</ul></a>'
            }, {
                name: "bold",
                text: '<a href="javascript:;" class="contorl-a contorl-blod" data-type="bold" ><span title="文本加粗" class="contorl-txt"></span></a>'
            }, {
                name: "italic",
                text: '<a href="javascript:;" class="contorl-a contorl-italic" data-type="italic"><span title="文本倾斜" class="contorl-txt"></span></a>'
            }, {
                name: "underline",
                text: '<a  href="javascript:;"" class="contorl-a contorl-underline" data-type="underline"><span title="下划线" class="contorl-txt"></span></a> '
            }, {
                name: "foreColor",
                text: '<a href="javascript:;" class="contorl-a contorl-color contorl-a-subnav" data-type="foreColor"><span  title="设置字体颜色" class="contorl-txt"></span>' +
                    '<ul class="e-sub-list color-list">' +
                    '<li data-value="#000000" class="e-c-black"></li>' +
                    '<li data-value="#FF0000" class="e-c-red"></li>' +
                    '<li data-value="#8B0000" class="e-c-dark-red"></li>' +
                    '<li data-value="#483D8B" class="e-c-blue-ashes"></li>' +
                    '<li data-value="#00BFFF" class="e-c-sky-blue"></li>' +
                    '<li data-value="#9932CC" class="e-c-violet-deep"></li>' +
                    '<li data-value="#9ACD32" class="e-c-yellow-green"></li>' +
                    '<li data-value="#00FF00" class="e-c-acid-green"></li>' +
                    '<li data-value="#FF8C00" class="e-c-deep-orange"></li>' +
                    '<li data-value="#FF00FF" class="e-c-purplish-red"></li>' +
                    '<li data-value="#48D1CC" class="e-c-medium-turquoise"></li>' +
                    '<li data-value="#66666" class="e-c-gray"></li>' +
                    '</ul></a>'
            }, {
                name: "fTitle",
                text: '<a href="javascript:;" class="contorl-a contorl-title contorl-a-subnav" data-type="fTitle"><span  title="设置标题" class="contorl-txt"></span>' +
                    '<ul class="e-sub-list title-list">' +
                    '<li data-value="h1" class="e-t-h1"> 一级标题</li>' +
                    '<li data-value="h2" class="e-t-h2">二级标题</li>' +
                    '<li data-value="h3" class="e-t-h3">三级标题</li>' +
                    '<li data-value="h4" class="e-t-h4">四级标题</li>' +
                    '<li data-value="h5" class="e-t-h5">五级标题</li>' +
                    '</ul></a>'
            }]
        }, {
            type: "btnText",
            val: [{
                name: "link",
                text: '<a href="javascript:;"  data-type="createLink"  class="contorl-a contorl-link"><span title="添加超链接" class="contorl-txt"></span></a><span class="e-relative"><div class="pop pop-set-link" style="display:none;">' +
                    '<div class="pop-header">' +
                    '<a href="javascript:;"  class="pop-close" title="关闭">x</a>' +
                    '<h2 class="e-title">插入链接</h2>' +
                    '</div>' +
                    '<div class="pop-main">' +
                    '<label for="" class="e-url-title">标题：<input type="text" data-type="urltitle"></label>' +
                    '<label for="" class="e-url-link">链接：<input type="text" data-type="urlLink" placeholder="默认为链接地址"> </label>' +
                    '</div>' +
                    '<div class="btn">' +
                    '<span class="confirm">确认</span>' +
                    '</div>' +
                    '</div></span>'
            }, {
                name: "unLink",
                text: '<a href="javascript:;"  data-type="Unlink" class="contorl-a contorl-unlink"><span title="取消超链接" class="contorl-txt"></span></a>'
            }, {
                name: "justifyleft",
                text: '<a href="javascript:;" class="contorl-a contorl-left" data-type="justifyleft" ><span title="文本居左" class="contorl-txt"></span></a>'
            }, {
                name: "justifycenter",
                text: '<a href="javascript:;" class="contorl-a contorl-center" data-type="justifycenter"><span title="文本居中" class="contorl-txt"></span></a>'
            }, {
                name: "justifyright",
                text: '<a href="javascript:;" class="contorl-a contorl-right" data-type="justifyright" ><span title="文本居右" class="contorl-txt"></span></a>'
            }, {
                name: "insertHorizontalRule",
                text: '<a href="javascript:;"  class="contorl-a contorl-hr" data-type="insertHorizontalRule"  ><span title="分隔线" class="contorl-txt"></span></a>'
            }]
        }, {
            type: "btnOther",
            val: [{
                name: "table",
                text: '<a href="javascript:;"  data-type="table" class="contorl-a contorl-table"><span title="添加表格" class="contorl-txt"></span></a><span class="e-relative"><div class="pop pop-set-table">' +
                    '<div class="pop-header">' +
                    '<a href="javascript:;"  class="pop-close" title="关闭">x</a>' +
                    '<h2 class="e-title">插入表格</h2>' +
                    '</div>' +
                    '<div class="pop-main">' +
                    '<label for="tableTr">表格行数 <input type="text" value="2" class="tableTr"  /></label>' +
                    '<label for="tableTd">表格列数 <input type="text" value="2" class="tableTd" /></label>' +
                    '<div class="btn">' +
                    '<span class="confirm">确认</span>' +
                    '</div>' +
                    '</div>' +
                    '</div></span>'
            }, {
                name: "view",
                text: '<a href="javascript:;"  data-type="preview" class="contorl-a contorl-preview"><span title="预览" class="contorl-txt"></span></a>'
            }, {
                name: "code",
                text: '<a href="javascript:;"  data-type="code" class="contorl-a contorl-code"><span title="源码" class="contorl-txt"></span></a>'
            }, {
                name: "undo",
                text: '<a href="javascript:;"  data-type="Undo" class="contorl-a contorl-undo"><span title="撤消" class="contorl-txt"></span></a>'
            }, {
                name: "redo",
                text: '<a href="javascript:;"  data-type="Redo" class="contorl-a contorl-redo"><span title="重做" class="contorl-txt"></span></a>'
            }, {
                name: "fWin",
                text: '<a href="javascript:;"  data-type="fullWin" class="contorl-a contorl-full"><span title="全屏" class="contorl-txt"></span></a>'
            }]
        }, {
            type: "pop",
            val: [{
                name: "pPreview",
                text: '<div class="pop pop-preview">' +
                    '<div class="pop-header">' +
                    '<a href="javascript:;"  class="pop-close" title="关闭">x</a>' +
                    '<h2 class="e-title">预览</h2>' +
                    '</div>' +
                    '<div class="pop-main"></div>' +
                    '</div>'
            }]
        }

    ]

    var width = parseInt(_this.editorWidth) + parseInt(_this.idFir.find("iframe").css("padding-left")) * 2;
    this.idFir.append(contorlBar);
    this.idFir.find(".editor-contorl").append(contorFont);
    for (i in menuHtml) {
        for (j in menuHtml[i].val) {
            _this.menuStu = true;
            if (_this.filter == false) {
                if (menuHtml[i].type == 'btnFont') {
                    _this.idFir.find(".e-set-font").append(menuHtml[i].val[j].text)
                } else if (menuHtml[i].type == 'mutual') {
                    _this.idFir.find(".e-mutual").append(menuHtml[i].val[j].text)
                } else {

                    if (menuHtml[i].val[j].name == 'code') {
                        _this.idFir.find(".e-editor").children("iframe").after("<div class='code-textarea'><textarea  name='" + _this.textareaName + "'></textarea></div>");
                    }
                    if (menuHtml[i].val[j].name == 'pPreview') {
                        _this.idFir.after(menuHtml[i].val[j].text)
                    } else {
                        _this.idFir.find(".editor-contorl").append(menuHtml[i].val[j].text)
                    }
                }
            } else {
                for (k in _this.filter) {
                    var n = _this.filter.length;
                    if (menuHtml[i].val[j].name == _this.filter[k]) {
                        _this.menuStu = false;
                        break;
                    } else if (_this.menuStu == true && _this.filter[k] != menuHtml[i].val[j].name && k == n - 1) {
                        if (menuHtml[i].type == 'btnFont') {
                            _this.idFir.find(".e-set-font").append(menuHtml[i].val[j].text)
                        } else if (menuHtml[i].type == 'mutual') {
                            _this.idFir.find(".e-mutual").append(menuHtml[i].val[j].text)
                        } else {
                            if (menuHtml[i].val[j].name == 'code') {
                                _this.idFir.find(".e-editor").children("iframe").after("<div class='code-textarea'><textarea  name='" + _this.textareaName + "'></textarea></div>");
                            }
                            if (menuHtml[i].val[j].name == 'pPreview') {
                                _this.idFir.after(menuHtml[i].val[j].text)
                            } else {
                                _this.idFir.find(".editor-contorl").append(menuHtml[i].val[j].text);
                            }
                        }
                        _this.menuStu = false;
                    }

                }

            }
        }

    }
    var eleClass = "contorl-a:not('.e-set-font-contorl,.contorl-a-subnav')";

    _this.bind();

    if (_this.idFir.find(".editor-contorl").css("text-align") == 'right') {
        _this.idFir.find(".pop").css({
            "left": "auto",
            "right": 0
        })
    }
}

proto.bind = function(ele, obj, ev, fn, append) {

    var _this = this;

    if (_this.ie == true) {
        this.getSelpor();
    }

    function selectionStr() {
        return !document.selection ? _this.idEditorWin.document.getSelection().toString() : this.idEditorWin.document.selection.createRange();
    }

    if (obj != undefined) {
        var eleWarp = append ? append : '.editor-contorl';
        _this.idFir.find(eleWarp).append(ele);
        _this.idFir.find(obj).addClass("contorl-a");
        $(obj).bind(ev, fn); //自定义事件
    } else {
        //编辑按钮事件
        _this.idFir.find(".contorl-a:not('.e-set-font-contorl,.contorl-a-subnav')").off("click").on("click", function() {

            $(this).siblings(".e-relative").find(".pop").hide();

            var attrVal = $(this).attr("data-type");

            switch (attrVal) {
                case 'insertHorizontalRule':
                    if (_this.ie == true || _this.isIE11 == true) {
                        _this.getFocus();
                    } //修复在ie下，焦点丢失，导致分隔线无法正常使用
                    _this.setEditor.execCommand("insertHorizontalRule");
                    break;
                case 'justifycenter':
                    _this.setEditor.execCommand("justifycenter");
                    if (_this.ie == false) {
                        var pranteObj = _this.isIE11 == false ? "div" : "p";
                        var elClass = _this.idEditorWin.getSelection().focusNode.parentNode;
                        $(elClass).closest(pranteObj).removeClass("e-j-left").addClass("e-j-center").removeAttr("style");
                        $(elClass).closest(pranteObj).removeAttr("align");
                    }
                    break;
                case 'justifyleft':
                    _this.setEditor.execCommand("justifyleft");
                    if (_this.ie == false) { // 
                        var pranteObj = _this.isIE11 == false ? "div" : "p";
                        var elClass = _this.idEditorWin.getSelection().focusNode.parentNode;
                        $(elClass).closest(pranteObj).removeClass("e-j-center").addClass("e-j-left").removeAttr("style");
                        $(elClass).closest(pranteObj).removeAttr("align");
                    }
                    break;
                case 'createLink':
                    if (_this.ie == true) {
                        _this.getSelpor();
                    } else if (_this.isIE11) {
                        _this.getFocus();
                        range = _this.setEditor.getSelection().getRangeAt(0);
                    }
                    if (_this.ie != true && selectionStr()) {
                        var rangeText2 = selectionStr();
                    }
                    rangeTxt = _this.ie ? _this.rangeText : rangeText2;
                    if (rangeTxt) {
                        $(this).closest(".editor-contorl").find(".pop-set-link").find(".e-url-title").hide();
                        $(this).closest(".editor-contorl").find(".pop-set-link").show();
                    } else {
                        $(this).closest(".editor-contorl").find(".pop-set-link").find(".e-url-title").show();
                        $(this).closest(".editor-contorl").find(".pop-set-link").show();
                    }

                    $(this).closest(".editor-contorl").find(".pop-main input").eq(1).click(function() {
                        $(this).removeClass("e-error")
                    })

                    $(this).closest(".editor-contorl").find(".pop-set-link .confirm").off('click.editor').on('click.editor', function() {
                        if (_this.ie == false && selectionStr()) {
                            var rangeText2 = selectionStr();
                        }
                        if (_this.ie == true) {
                            _this.setSelpor();
                        }

                        var url = $.trim($(this).closest(".pop").find($("input[data-type='urlLink']")).val()),
                            title = $.trim($(this).closest(".pop").find($("input[data-type='urltitle']")).val());

                        if (/^http[s]?:\/\//.test(url)) {
                            if (_this.isIE11 == true) {
                                var text = _this.idEditorWin.document.createElement("a");
                                text.href = url;
                                text.target = "_blank";
                            }
                            if (!rangeTxt) {
                                if (title === '') {
                                    if (_this.isIE11 == true) {
                                        text.innerHTML = url;
                                        _this.insertHTML(text, range)
                                    } else {
                                        _this.insertHTML('<a href="' + url + '" target="_blank">' + url + '</a>');
                                    }
                                } else {
                                    if (_this.isIE11 == true) {
                                        text.innerHTML = title;
                                        _this.insertHTML(text, range)
                                    } else {
                                        _this.insertHTML('<a href="' + url + '" target="_blank">' + title + '</a>');
                                    }
                                }
                            } else {
                                if (_this.isIE11 == true) {
                                    text.innerHTML = rangeTxt;
                                    _this.insertHTML(text, range)
                                } else {
                                    _this.insertHTML('<a href="' + url + '" target="_blank">' + rangeTxt + '</a>');
                                }
                            }
                            $(this).closest(".pop").find("input").val("");
                            $(this).closest(".pop").hide();

                        } else {

                            $(this).parent().siblings(".pop-main").find("input").eq(1).addClass("e-error");
                            console.info("用户未填写时提示") //用户未填写时提示
                        }
                    })
                    break;
                case 'table':

                    if (_this.ie == true) {
                        _this.getSelpor();
                    } else if (_this.isIE11 == true) {
                        _this.getFocus();
                        var range = _this.setEditor.getSelection().getRangeAt(0);
                    }

                    if (_this.ie == false && selectionStr()) {
                        var rangeText2 = selectionStr();
                    }
                    rangeTxt = _this.ie ? _this.rangeText : rangeText2;

                    //弹出表格设置框
                    $(this).closest(".editor-contorl").find(".pop-set-table").show();

                    $(this).closest(".editor-contorl").find(".pop-set-table .confirm").off('click.table').on('click.table', function() {

                        if (_this.ie == false && selectionStr()) {
                            var rangeText2 = selectionStr();
                        }
                        if (_this.ie == true) {
                            _this.setSelpor();
                        }

                        var i = 0,
                            j = 0,
                            telHtml = '',
                            trHtml = '',
                            tdHtml = '',
                            tableTdw = 0;
                        var tableTr = $(this).closest(".pop").find("input.tableTr").val(),
                            tableTd = $(this).closest(".pop").find("input.tableTd").val(),
                            tableTdw = $(this).closest(".pop").find("input.tableTdw").val(),
                            tableTdc = $(this).closest(".pop").find("input.tableTdc").val();
                        tableTr = tableTr != '' ? (tableTr > 30 ? 2 : tableTr) : 2;
                        tableTd = tableTd != '' ? (tableTd > 30 ? 2 : tableTd) : 2;
                        tableTdw = tableTdw != '' ? (tableTdw > 638 ? 638 + "px" : tableTdw) : 100 + "%"; //判断用户写的数值是否超出帖子宽度，超出则显示最大宽度;
                        for (var i; i < tableTr; i++) {
                            for (var j; j < tableTd; j++) {
                                tdHtml += "<td>&nbsp;</td>";
                            }
                            trHtml += "<tr>" + tdHtml + "</tr>";
                        }

                        var telHtml = "<table class='e-table-inner' width='638px' bgcolor='#ffffff'  cellspacing='0' cellpadding='0'>" +
                            "<tbody>" + trHtml + "</tbody>" +
                            "</table><span>&nbsp;</span>";
                        _this.insertHTML(telHtml, range, "table");

                        $(this).closest(".pop").hide();
                    });
                    break;
                case 'fullWin':
                    if ($(this).closest(_this.idFir).hasClass("full-win")) {
                        $(this).closest(_this.idFir).removeClass("full-win");
                        $(this).closest(_this.idFir).find("iframe").removeAttr("style");
                    } else {
                        $(this).closest(_this.idFir).addClass("full-win");
                        var ifrPadding = parseInt(_this.idFir.find("iframe").css("padding-left")) * 3;
                        var titHeight = _this.idFir.find("div:not('.editor-contorl,.e-editor')").length > 0 ? _this.idFir.find("div:not('.editor-contorl,.e-editor')").outerHeight() : "";
                        $(this).closest(_this.idFir).find("iframe").height($(window).height() - _this.idFir.find(".editor-contorl").outerHeight() - titHeight - ifrPadding)
                    }
                    break;
                case 'preview':
                    _this.preview();
                    break;
                case 'code':
                    var htmlContent = _this.idEditorWin.document.body.outerHTML;
                    if (_this.idFir.find(".code-textarea").is(":visible")) {
                        var textContent = _this.idFir.find(".code-textarea").children("textarea").val();
                        _this.idEditorWin.document.body.innerHTML = textContent;
                        _this.idFir.find(".code-textarea").hide();
                    } else {
                        _this.idFir.find(".code-textarea").children("textarea").val(htmlContent);
                        _this.idFir.find(".code-textarea").show();
                    }

                    break;
                case 'atFriend':
                    $(this).closest(".e-mutual").siblings(".pop-at").show();
                    break;
                default:
                    _this.getFocus();
                    _this.setEditor.execCommand(attrVal);
                    break;
            }

            _this.getFocus();
        })
    }
    //设置字体格式隐藏显示
    _this.idFir.find(".e-set-font-contorl").click(function() {
        if ($(this).siblings(".e-set-font").is(":visible")) {
            $(this).siblings(".e-set-font").css("display", "none");
            $(this).attr("title", "展开字体设置");
        } else {
            $(this).siblings(".e-set-font").css("display", "inline-block");
            $(this).attr("title", "收回字体设置");
        }
    })

    //弹出框事件操作
    _this.idFir.find(".tableTdc").click(function() {
        $(this).siblings(".e-sub-list").show();
    })
    _this.idFir.find(".tableTdc").hover(function() {
        $(this).siblings(".e-sub-list").hide();
    })
    _this.idFir.find(".e-sub-list").hover(function() {
        $(this).show();
    }, function() {
        $(this).hide();
    })
    _this.idFir.find(".pop-set-table .e-sub-list li").click(function(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            window.event.returnValue = false;
            return false;
        }
        $(this).parent(".e-sub-list").siblings("input").val($(this).attr("data-value"));
        $(this).parent(".e-sub-list").hide();
    })
    _this.idFir.find(".pop-set-table label input:not('.tableTdc')").keyup(function() {
        var value = $(this).val();
        if (value.length == 1) {
            value = value.replace(/[^1-9]/g, '')
        } else {
            value = value.replace(/\D/g, '')
        }
        $(this).val(value)
    })
    _this.idFir.parent("div").find("input").focus(function() {
        $("." + _this.selecte).removeClass(_this.selecte);
        _this.idFir.addClass(_this.selecte);
    })
    _this.idFir.find(".code-textarea textarea").focus(function() {
        $("." + _this.selecte).removeClass(_this.selecte);
        _this.idFir.addClass(_this.selecte);
    })
    $(".pop .pop-close").on("click", function() {
        $(this).parents(".pop").hide();
        $(".e-overlayou").removeAttr("style").hide();
    })

    //二级菜章
    _this.idFir.find(".contorl-a-subnav li").click(function(e) {
        var attrVal = $(this).closest(".contorl-a").attr("data-type");
        var subVal = $(this).attr("data-value");
        _this.getFocus();
        if ($(this).parent("ul").hasClass("title-list")) {
            if (_this.ie == true) {
                _this.getSelpor();
            } else if (_this.isIE11) {
                _this.getFocus();
                range = _this.setEditor.getSelection().getRangeAt(0);
            }

            if (_this.ie != true && selectionStr()) {
                var rangeText2 = selectionStr();
            }

            rangeTxt = _this.ie ? _this.rangeText : rangeText2;
            if (_this.isIE11 == true) {
                var text = _this.idEditorWin.document.createElement(subVal);
            }

            if (rangeTxt != undefined) {
                if (_this.isIE11 == true) {
                    text.innerHTML = rangeTxt;
                    _this.insertHTML(text, range, "二级菜章")
                } else {
                    _this.insertHTML('<' + subVal + '>' + rangeTxt + '</' + subVal + '>');
                }
            }
        } else {
            if (attrVal == 'fontname' || attrVal == 'fontSize') {
                $(this).parent(".e-sub-list").siblings(".contorl-txt").text($(this).text());

            }
            $(this).parent("ul").hide();
            _this.setEditor.execCommand(attrVal, false, subVal);
            if (e && e.stopPropagation) {
                e.stopPropagation(); 
            } else {        
                window.event.cancelBubble = true;
            }

        }
    })

    _this.idFir.find(".editor-contorl").find(".contorl-a-subnav").click(function() {
        _this.getFocus();
        $(this).closest(".editor-contorl").find(".e-sub-list").hide();
        $(this).children(".e-sub-list").show();
    }).hover(function() {

    }, function() {
        $(this).children(".e-sub-list").hide();
    });

    _this.idFir.find(".editor-contorl").find(".contorl-a-subnav").children(".e-sub-list").hover(function() {
        $(this).children(".e-sub-list").show();
    }, function() {
        $(this).children(".e-sub-list").hide();
    })

    //下拉菜单点击事件
    _this.idFir.find(".color-list li").click(function() {
        var attrVal = $(this).closest(".contorl-a").attr("data-type");
        var val = $(this).attr("data-value");
        _this.setEditor.execCommand(attrVal, false, val);
        $(this).parent(".e-sub-list").hide();
    });

    _this.idFir.find("code-textarea").focus(function() {
        $("." + _this.selecte).removeClass(_this.selecte);
        _this.idFir.addClass(_this.selecte);
    }).blur(function() {
        _this.idFir.removeClass(_this.selecte);
    })

    //遮罩层点击事件
    $(".e-overlayou").click(function() {
        $(this).hide();
        _this.idFir.find(".pop").hide();
        _this.idFir.closest("body").find(".e-pop").hide();
        _this.idFir.siblings(".pop-preview").hide();
    })
}
//清除草稿
proto.clearSave = function(n) {
    var n = n || false;

    var storage = window.localStorage;
    var name = _this.saveCon;
    var otherName = _this.saveName;
    localStorage.removeItem(name);
    localStorage.removeItem(otherName);
}

//清除内容
proto.clearContent = function() {
    var _this = this;
    return _this.idEditorWin.document.body.innerHTML = '';
}

//获取内容
proto.getContent = function() {
    var _this = this;
    if (_this.idFir.find(".code-textarea").length > 0 && _this.idFir.find(".code-textarea").css("display") == 'block') {
        var textContent = _this.idFir.find(".code-textarea").children("textarea").val();
        _this.idEditorWin.document.body.innerHTML = textContent;
    }
    return _this.idEditorWin.document.body.innerHTML
}
//预览
proto.preview = function() {
    var _this = this;
    var htmlContent = _this.idEditorWin.document.body.innerHTML;
    $(".e-overlayou").height($(window).height()).show();
    _this.idFir.siblings(".pop-preview").show().children(".pop-main").html(htmlContent);

    var pml = parseInt($(_this.idFir).siblings(".pop-preview").css("margin-top")); // pop margin left value
    var pmh = parseInt($(_this.idFir).siblings(".pop-preview").children(".pop-main").height()); // pop main height
    var phh = parseInt($(_this.idFir).siblings(".pop-preview").children(".pop-header").outerHeight()) + parseInt($(_this.idFir).siblings(".pop-preview").children(".pop-header").css("margin-bottom")); //pop head height
    var wh = parseInt($(window).height()) - phh - (pml * 2) - parseInt($(_this.idFir).siblings(".pop-preview").css("padding-left")) * 4;

    if (wh > pmh) {
        $(_this.idFir).siblings('.pop-preview').css({
            'top': ($(window).height() - $(_this.idFir).siblings(".pop-preview").height()) / 2,
            'left': "50%"
        });
        $(_this.idFir).siblings('.pop-preview').children(".pop-main").css({
            "overflow": "hidden"
        });
    } else {
        $(_this.idFir).siblings('.pop-preview').css({
            'top': 0,
            'left': "50%"
        });
        $(_this.idFir).siblings('.pop-preview').children(".pop-main").css({
            "top": 0,
            "height": wh + "px",
            "overflow": "auto"
        })
    }
}
proto.save = function() {
    var _this = this;
    if (window.localStorage) {
        var storage = window.localStorage;
        var name = _this.saveCon;
        storage.setItem(name, _this.idEditorWin.document.body.innerHTML);

        if (_this.saveName != false) {
            var otherName = _this.saveName;
            if (_this.num == '') {
                storage.setItem(otherName, $('input[name="' + _this.saveName + '"]').val());
            } else {
                var name = _this.saveName.replace(/[^(A-Za-z)]/g, '');
                storage.setItem(_this.saveName, $('input[name="' + name + '"]').val());
            }
        }

        if (!_this.idFir.find("div").hasClass("e-save-notice")) _this.idFir.find(".e-editor").append("<div class='e-save-notice'>草稿已保存<span class='e-arrow'></span></div>");
        $('.e-save-notice').fadeIn(1000);
        setTimeout(function() {
            $('.e-save-notice').fadeOut(1000, function() {
                $(this).remove();
            })
        }, 1500)

        if (_this.autoSave == 'true') {
            _this.interval = setTimeout(function() {
                _this.save();
            }, _this.saveTime)
        }
    }
}
//获取焦点
proto.getFocus = function() {
    var _this = this;
    $("." + _this.selecte).removeClass(_this.selecte);
    _this.idFir.addClass(_this.selecte);
    return _this.setEditor.body.focus();
}
//失去焦点
proto.getBlur = function() {
    var _this = this;
    $('.' + _this.selecte).removeClass(_this.selecte);
    return _this.setEditor.body.blur();
}
//内容插入
proto.insertHTML = function(text, range, location) {
    var _this = this;
    _this.getFocus();
    if (_this.ie == true) {
        _this.setSelpor();
        _this.setEditor.selection.createRange().pasteHTML(text);
    } else if (_this.isIE11 == true) {

        var len = $(text, $(_this.idEditor).contents()).length;
        var node = $(text, $(_this.idEditor).contents());

        if (range == undefined) {
            console.log("range undefined")
            range = _this.rangeIe;
        }

        if (range != "") {
            if (len > 1) {
                for (var i = 0; i < len; i++) {
                    range.surroundContents($(text, $(_this.idEditor).contents()).get(i))
                }

            } else {
                range.surroundContents(text);
            }
        } else {
            if (len > 1) {
                for (var i = 0; i < len; i++) {
                    range.insertNode($(text, $(_this.idEditor).contents()).get(i))
                }

            } else {
                range.insertNode(text);
            }
        }
    } else {
        _this.setEditor.execCommand('InsertHtml', '', text);
    }
}

module.exports = Editor;