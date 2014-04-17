jQuery(function() {
    
            $.ajax({
                type: "POST",
                dataType: 'jsonp',
                url: "//test-doctu.ru/dispatch.php?act=doctor/jsonSearchResults",
                data: get_search_data(),
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                }
            });


    $("#searchResults, #doctorPage, #clinicModal, #doctorList")
            .on("click", ".showScheduleBtn", function() {

        var timeTxt = '';
        var dateTxt = '';
        $("#docModal .doc-datetime").hide();

//        var timeTxt = $(this).attr("data-time").substr(0, 5);
//        var dateTxt = $(this).attr("data-datetxt");


        $("#docModal .doc-date span").html(dateTxt);
        $("#docModal .doc-time span").html(timeTxt);

        var doctorName = $(this).closest("[data-doctor]").data("name");
        var doctorFamilyName = $(this).closest("[data-doctor]").data("family");
        var doctorSpeciality = $(this).closest("[data-doctor]").data("speciality");
        var doctorPhoto = $(this).closest("[data-doctor]").data("photo");
        var clinicPhone = $(this).closest("[data-doctor]").data("clinicphone");
        var clinicLogo = $(this).closest("[data-doctor]").data("cliniclogo");
        var clinicUrl = $(this).closest("[data-doctor]").data("clinicurl");

        $("#docModal .doc-name h4").html(doctorName);
        $("#docModal .doc-name h3").html(doctorFamilyName);
        $("#docModal .doc-name .specialty").html(doctorSpeciality);
        $("#docModal .doc-name img").attr('src', doctorPhoto);
        $("#docModal .doc-address img.map").attr('src', clinicLogo);
        $("#docModal .bookByPhone").html(clinicPhone ? 'Для записи на прием позвоните по телефону <b>'+clinicPhone+'</b>.' : '');

        var doctorMetro = $(this).closest("[data-doctor]").data("metro");
        var doctorAddress = $(this).closest("[data-doctor]").data("address");
        $("#docModal .doc-address .metro span").html(doctorMetro);
        $("#docModal .doc-address .address span").html(doctorAddress);

        // форма отправки
        var doctorId = $(this).closest("[data-doctor]").data("doctor");
        var date = $(this).attr("data-date");
        var time = $(this).attr("data-time");
        $("#docModal input[name=workerId]").val(doctorId);
        /*$("#docModal input[name=orderDate]").set('select', date);
        $("#docModal input[name=orderTime]").set('select', time);*/

        // вспоминаем клиента
        /*var fio = localStorage.getItem('fio');
        var email = localStorage.getItem('email');
        var phone = localStorage.getItem('phone');
        if (fio)
            $("#docModal input[name=fio]").val(fio);
        if (email)
            $("#docModal input[name=email]").val(email);
        if (phone)
            $("#docModal input[name=phone]").val(phone);*/


        $("#docModal input").trigger("keyup");
        $("#docModal .addComment").html("Добавить комментарий");
        $("#docModal .patientComment").hide();


        // логика кнопок
        $("#docModal .smsCodeBlock").hide();
        $("#docModal .successBlock").hide();
        $("#docModal .continueBlock").show();

        $("#docModal .codeInput").css('opacity', 0);
        $("#docModal input[name=code]").val('');
        $("#docModal .getCodeLink").show();
        $("#docModal .getCodeText").hide();
        $("#docModal [name=continueBookingBtn]").html('Продолжить');

        // init
        $("#docModal button[type=submit]").attr("disabled", false);
        $("#docModal button[type=submit] i").addClass("icon-ok").removeClass("icon-spinner icon-spin");

        $("#docModal button[name=bookCustomer]").attr("disabled", true);
        
        if($(this).parents("section") == $("#docModal").prev()) {
            $("#docModal").toogle();
        } else {
            $("#docModal").insertAfter($(this).parents("section"));
            console.log ($(this).parents("section"));
            toPos = $(this).parents("section").width()*$(this).parents("section").prevAll("section").length;
            
            console.log(toPos ,$(this).parents("section").prevAll("section").length);
           
            $("#docModal").hide();
            $("#docModal").show(100);
            $("#doctorList").mCustomScrollbar("scrollTo", toPos);
        }
        //$("#docModal").jqmShow();
        return false;
    });
        
    set_doctor = function(fulldata) {
       // $("#doctorList").append(paginate(fulldata.rowCount));
        //data = fulldata.doclist;
        $.get("doctor.html", function(templateBody) {
            $.template("tmpl", templateBody);
            $.tmpl("tmpl", fulldata).appendTo("#doctorList");
        });
    };
    
    set_data = function(fulldata) {
        data = fulldata.doclist;
        $.get("tmpl.html", function(templateBody) {
            $.template("tmpl", templateBody);
            $.tmpl("tmpl", data).prependTo("#doctorList");
            $("#paging").prepend(paginate(fulldata.rowCount));
            set_scroling();
        });
        $.get("scheldModal.html", function(templateBody) {
            $.template("tmpl_doc", templateBody);
            $.tmpl("tmpl_doc").appendTo("#docModal");
            $.mask.definitions['~'] = "[+-]";
            
            $(".doc-form input[name=phone]").mask("+7 ?(999) 999-99-99");

            $('.doc-form input').on("input", function() {
                $(".doc-form .error").hide();

            });

            $("#docModal input").on("keyup", function() {

                /*localStorage.setItem('fio', $("#docModal input[name=fio]").val());
                localStorage.setItem('email', $("#docModal input[name=email]").val());
                localStorage.setItem('phone', $("#docModal input[name=phone]").val());*/

                if ($("#docModal input[name=code]").val() === '')
                    $("#docModal button[name=bookCustomer]").attr("disabled", true);
                else
                    $("#docModal button[name=bookCustomer]").attr("disabled", false);

                if ($("#docModal input[name=fio]").val().match(/([a-zA-zа-яА-Я\-]{2,}\s+?([a-zA-zа-яА-Я\-]{2,}\s*?){1,2})/))
                    $("#docModal input[name=fio]").addClass("valid").closest(".form-group").find(".error").hide();
                else
                    $("#docModal input[name=fio]").removeClass("valid");

                if ($("#docModal input[name=email]").val().match(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/))
                    $("#docModal input[name=email]").addClass("valid").closest(".form-group").find(".error").hide();
                else
                    $("#docModal input[name=email]").removeClass("valid");

                if ($("#docModal input[name=phone]").val().match(/^\+7\s\(\d{3}\)\s\d{3}(\-\d{2}){2}$/))
                    $("#docModal input[name=phone]").addClass("valid").closest(".form-group").find(".error").hide();
                else
                    $("#docModal input[name=phone]").removeClass("valid");
            });

            $(".addComment").click(function() {
                if (!$("#patientComment").is(":visible")) {
                    $("#patientComment").slideDown();
                    $(".addComment").html("Убрать комментарий");
                } else {
                    $("#patientComment").slideUp();
                    $(".addComment").html("Добавить комментарий");
                }

                return false;
            });

            $("#docModal form").submit(function(e) {

                if ($("#docModal input[name=code]").val() == '') {
                    var valid = true;
                    if (!$("#docModal input[name=fio]").val().match(/([a-zA-zа-яА-Я\-]{2,}\s+?([a-zA-zа-яА-Я\-]{2,}\s*?){1,2})/)) {
                        $("#docModal input[name=fio]").closest(".form-group").find(".error").show();
                        valid = false;
                    }

                    if (($("#docModal input[name=email]").val() != '') && !$("input[name=email]").val().match(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/)) {
                        $("#docModal input[name=email]").closest(".form-group").find(".error").show();
                        valid = false;
                    }

                    if (!$("#docModal input[name=phone]").val().match(/^\+7\s\(\d{3}\)\s\d{3}(\-\d{2}){2}$/)) {
                        $("#docModal input[name=phone]").closest(".form-group").find(".error").show();
                        valid = false;
                    }

                    if (valid) {
                        $("#docModal .smsCodeBlock").slideDown();
                        $("#docModal [name=continueBookingBtn]").html('Записаться').addClass('loading');
                        $("#docModal .codeInput").animate({'opacity': 1}, function() {
                            $("#docModal input[name=code]").focus();
                        });

                        if (!$("#patientComment").is(":visible"))
                            $("#patientComment textarea").val('');

                        $.getJSON("/dispatch.php?act=getBookingCode", $(this).serialize(), function(data, text) {
                            $("#docModal [name=continueBookingBtn]").removeClass('loading');
                        });
                    }
                } else {
                    var date = $(this).attr("data-date");
                    var time = $(this).attr("data-time");
                    $("#docModal [name=continueBookingBtn]").addClass('loading');
                    $.getJSON('/dispatch.php?act=bookCustomer', $(this).serialize(), function(data) {
                        $("#docModal [name=continueBookingBtn]").removeClass('loading');
                        if (data.status == 'ok') {
                            $("#docModal .continueBlock").hide();
                            $("#docModal .successBlock").show();

                            $("#docModal .successBlock p.infoMsg").html(data.infoMsg);
                            $("#docModal .successBlock p.noteMsg").html(data.noteMsg);
                        } else {
                            alert(data.error);
                        }
                    });
                }
                return false;
            });

        });
    };

});

//var set_data;
    function set_scroling(){
        $("#doctorList").mCustomScrollbar({
            advanced: {
                updateOnContentResize: true,
                autoScrollOnFocus: true
            },
            contentTouchScroll: true,
            set_height: 440,
            theme: "dark-thick",
            scrollInertia: 500,
            mouseWheelPixels: 280
        });
    }
    
function get_rating_stars(rate) {
    if (rate === 0)
        stars = '00000';
    else if (rate <= 0.25)
        stars = '-----';
    else if (rate <= 0.75)
        stars = 'x----';
    else if (rate <= 1.25)
        stars = 'X----';
    else if (rate <= 1.75)
        stars = 'Xx---';
    else if (rate <= 2.25)
        stars = 'XX---';
    else if (rate <= 2.75)
        stars = 'XXx--';
    else if (rate <= 3.25)
        stars = 'XXX--';
    else if (rate <= 3.75)
        stars = 'XXXx-';
    else if (rate <= 4.25)
        stars = 'XXXX-';
    else if (rate <= 4.75)
        stars = 'XXXXx';
    else
        stars = 'XXXXX';
    return stars.replace(/[0\-xX]/g, function(str, p1, p2, offset, s) {
        if (str === 0)
            return '<img src="http://doctu.ru/assets/templates/design/less/img/nostar2.png">';
        if (str === '-')
            return '<img src="http://doctu.ru/assets/templates/design/less/img/whitestar.png">';
        if (str === 'x')
            return '<img src="http://doctu.ru/assets/templates/design/less/img/halfstar.png">';
        if (str === 'X')
            return '<img src="http://doctu.ru/assets/templates/design/less/img/goldstar.png">';
    });
}

function http_build_query(obj) {
    return jQuery.param(obj);
}

function getCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++)
    {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }
    return "";
}

function get_search_data() {
    var pairs = window.location.search.substring(1).split("&"),
            obj = {},
            pair,
            i;
    for (i in pairs) {
        if (pairs[i] === "")
            continue;
        pair = pairs[i].split("=");
        obj[ decodeURIComponent(pair[0]) ] = decodeURIComponent(pair[1]);
    }

    return obj;
}

function paginate(total_rows) {
    per_page = getCookie("paging") ? getCookie("paging") : 10;
    getParams = get_search_data();
    var page = (getParams['page']) ? parseInt(getParams['page']) : 1;
    var pageHtml = '<ul>';
    var num_pages = Math.ceil(total_rows / per_page);
    var urlArr = "?";

    if (num_pages == 1)
        return "";
    else {
        if (page > 1) {
            getParams['page'] = page - 1;
            var getParamsUrl = http_build_query(getParams);
            pageHtml += "<li><a href='" + urlArr + getParamsUrl + "'>« Предыдушая</a></li> ";
        }

        if (page <= 3) {
            for (var i = 1; i <= Math.min(Math.max(page + 2, 5), num_pages); i++) {
                getParams['page'] = i;
                getParamsUrl = http_build_query(getParams);
                pageHtml += (i == page) ? "<li><span>" + i + "</span></li>" : "<li><a href='" + urlArr + getParamsUrl + "'>" + i + "</a></li>";
            }
            if (num_pages > 5) {

                if (num_pages > 6) {
                    pageHtml += "<li><span>...</span></li>";
                }

                getParams['page'] = num_pages;
                getParamsUrl = http_build_query(getParams);
                pageHtml += "<li><a href='" + urlArr + getParamsUrl + "'>" + num_pages + "</a></li>";
            }

        } else if (page >= num_pages - 3) {
            if (num_pages > 5) {
                delete(getParams['page']);
                getParamsUrl = http_build_query(getParams);

                pageHtml += "<li><a href='" + urlArr + getParamsUrl + "'>1</a></li>";
                if (num_pages > 6) {
                    pageHtml += "<li><span>...</span></li>";
                }
            }


            for (i = Math.max(1, Math.min(page - 2, num_pages - 4)); i <= num_pages; i++) {
                getParams['page'] = i;
                getParamsUrl = http_build_query(getParams);
                pageHtml += (i == page) ? "<li><span>" + i + "</span></li>" : "<li><a href='" + urlArr + getParamsUrl + "'>" + i + "</a></li>";
            }

        } else {
            delete(getParams['page']);
            getParamsUrl = http_build_query(getParams);
            pageHtml += "<li><a href='" + urlArr + getParamsUrl + "'>1</a></li>";

            if (page - 3 > 1) {
                pageHtml += "<li><span>...</span>";
            }

            for (i = page - 2; i <= page + 2; i++) {
                getParams['page'] = i;

                if (getParams['page'] == 1)
                    delete(getParams['page']);
                getParamsUrl = http_build_query(getParams);
                pageHtml += (i == page) ? "<li><span>" + i + "</span></li>" : "<li><a href='" + urlArr + getParamsUrl + "'>" + i + "</a></li>";
            }

            if (page + 3 < num_pages) {
                pageHtml += "<li><span>...</span></li>";
            }

            getParams['page'] = num_pages;
            getParamsUrl = http_build_query(getParams);
            pageHtml += "<li><a href='" + urlArr + getParamsUrl + "'>" + num_pages + "</a></li>";
        }

        if (page < num_pages) {
            getParams['page'] = page + 1;

            getParamsUrl = http_build_query(getParams);
            pageHtml += "<li><a href='" + urlArr + getParamsUrl + "'>Следующая »</a><!-- link rel='prefetch' href='" + urlArr + getParamsUrl + "' --></li>";
        }


    }
    pageHtml += "</ul>";
    return pageHtml;
}