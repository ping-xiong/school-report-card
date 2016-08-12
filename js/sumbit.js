var distinction, credit, average, pass, fail;
var arr =new Array();
$(document).ready(function() {
    var username, password;
    $("#username").val(getCookie("studentNum"));
    $("#sumbit").click(function(event) {
        submitByAjax();
    });
    $(document).keyup(function(event) {
        var key = event.which;
        if (key == 13) {
            submitByAjax();
        }
    });
});

function notice(str) {
    var notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar({
        message: str
    });
}

function loadingOff() {
    $("#p2").css('display', 'none');
    $("#sumbit").removeAttr("disabled");
}

function loadingOn() {
    $("#p2").css('display', 'block');
    $("#sumbit").attr('disabled', 'disabled');
}

function submitByAjax() {
    username = $("#username").val();
    password = $("#password").val();
    if (username != "" && password != "") {
        loadingOn();
        $.ajax({
                url: 'php/login.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    username: username,
                    password: password
                },
            })
            .done(function(result) {
                setCookie("studentNum", username, "300");
                show(result);
            })
            .fail(function() {
            })
            .always(function() {
                loadingOff()
            });
    } else {
        notice("请输入学号和密码！");
    }
}

function show(result) {
    $("#show").html("");
    var th = ["课程", "学分", "平时", "期中", "期末", "总评", "绩点"];
    var flag = 0;
    // var resit = 0;
    var credits = 0;
    var temp = 0;
    var GPA = 0;
    arr =new Array();
    if (result["0"]["0"] == 1) {
        $("#username").val("");
        $("#password").val("");
        $("<canvas>").attr('id', 'myChart2').appendTo('#show');
        $("<canvas>").attr('id', 'myChart').appendTo('#show');
        $("<p>").text('小提示：轻戳统计图表显示具体数值。').css('color', '#757575').css('text-align', 'center').appendTo('#show');
        distinction = credit = average = pass = fail = 0;
        $("<div>").attr('id', 'profile').appendTo('#show');
        $.each(result, function(index, el) {
            if (index != 0) {
                $("<table>").addClass('mdl-data-table mdl-js-data-table mdl-shadow--2dp mdl-data-table--selectable').attr('id', index + '-table').appendTo('#show');
                $("<tr>").html("<th colspan='7' style='text-align:center;font-size:18px;'>第" + index + "学期</th>").appendTo('#' + index + '-table');
                $("<tr>").attr('id', index + '-table_th').appendTo('#' + index + '-table');
                $.each(th, function(index2, el2) {
                    $("<th>").text(el2).appendTo('#' + index + '-table_th');
                });
                $.each(el, function(index3, el3) {
                    if (index3 % 8 == 0) {
                        flag++;
                        $("<tr>").attr('id', flag + "-table_tr-" + index).appendTo('#' + index + '-table');
                    } else if (index3 % 8 != 0) {
                        $("<td>").html(el3).appendTo('#' + flag + "-table_tr-" + index);

                        if ((index3 - 6) % 8 == 0) {
                            coutGrade(el3);
                            if (el3 < 59 || el3 == "不及格" || el3 == "缺考" ) {
                              $('#' + flag + '-table_tr-' + index).addClass('fail');
                            }else if (el3 >= 90 || el3 == "优秀") {
                              $('#' + flag + '-table_tr-' + index).addClass('distinction');
                            }
                        }
                        if ((index3 - 2) % 8 == 0) {
                          //学分
                          credits += parseFloat(el3);
                          temp = parseFloat(el3);
                        }
                        if ((index3 - 7) % 8 == 0) {
                          //绩点
                          if (el3 != "" && el3 != " " && el3 != "&nbsp;" && el3 != 0 && el3 != "0") {
                            GPA += (parseFloat(el3)*temp);
                          } else {
                            credits -= temp;
                          }
                        }

                    }
                });
                arr.push((GPA/credits).toFixed(2));
            }
        });
        $("<p>").text('姓名：'+result["0"]["2"]).css('text-align', 'center').appendTo('#profile');
        $("<p>").text('学号：'+result["0"]["1"]).css('text-align', 'center').appendTo('#profile');
        $("<p>").text('平均积分绩点：'+arr[(arr.length-1)]).css('text-align', 'center').addClass('gpa').appendTo('#profile');
        degree(parseFloat(arr[(arr.length-1)]));
        draw2();
        draw();

    } else {
        notice("学号或者密码错误！请稍后再试！");
    }
}

function coutGrade(val) {
    if (100 >= val && val >= 90 || val == "优秀") {
        distinction++;
    } else if (89 >= val && val >= 80 || val == "良好") {
        credit++;
    } else if (79 >= val && val >= 70 || val == "中等") {
        average++;
    } else if (69 >= val && val >= 60 || val == "及格") {
        pass++;
    } else if (59 >= val && val >= 0 || val == "不及格") {
        fail++;
    }
}

function draw() {
    var ctx = $("#myChart");
    var data = {
        labels: ["100~90", "89~80", "79~70", "69~60", "59~0"],
        datasets: [{
            label: "总评成绩分布",
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1,
            data: [distinction, credit, average, pass, fail],
        }]
    };
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function draw2() {
  var str =new Array();
  for (var i = 0; i < arr.length; i++) {
    str.push(i+1);
  }
  var ctx2 = $("#myChart2");
  var data2 = {
    labels: str,
    datasets: [
        {
            label: "每个学期平均学分绩点",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: arr,
            spanGaps: false,
        }
    ]
};
var scatterChart = new Chart(ctx2, {
    type: 'line',
    data: data2,
    options: {
        scales: {
            xAxes: [{
                display: true
            }]
        }
    }
});
}

function setCookie(name, value, expireday) {
    var exp = new Date();
    exp.setTime(exp.getTime() + expireday*24*60*60*1000); //设置cookie的期限
    document.cookie = name+"="+escape(value)+"; expires"+"="+exp.toGMTString();//创建cookie
}
function getCookie(name) {
    var cookieStr = document.cookie;
    if(cookieStr.length > 0) {
        var cookieArr = cookieStr.split(";"); //将cookie信息转换成数组
        for (var i=0; i<cookieArr.length; i++) {
            var cookieVal = cookieArr[i].split("="); //将每一组cookie(cookie名和值)也转换成数组
            if(cookieVal[0] == name) {
              $("#focused").addClass('is-dirty');
                return unescape(cookieVal[1]); //返回需要提取的cookie值
            }
        }
    }
}

function degree(gpa){
  console.log(gpa);
  if (gpa < 6.6) {
    $(".gpa").css('background-color', '#f44336');
  } else if (gpa >= 6.6 && gpa < 8) {
    $(".gpa").css('background-color', '#6495ed');
  }else if (gpa >= 8 && gpa < 9) {
    $(".gpa").css('background-color', '#8bc34a');
  }else if (gpa >= 9) {
    $(".gpa").css('background-color', '#4caf50');
  }else {
    $(".gpa").css('background-color', '#009688');
  }
}
