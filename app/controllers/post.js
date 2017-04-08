'use strict';

$(document).ready(function() {
    nameFunc();
    if (window.location.pathname == '/') listView();
    if (window.location.pathname == '/my') openMy();
    if (window.location.pathname == '/requests') requestShow();
    $(".list").on("click", "div.request", function() {
        request(this.id);
    });
    $(".listR").on("click", "div.remove", function() {
        removeR(this.id);
    });
    $(".list").on("click", "div.remove", function() {
        remove(this.id);
    });
    $(".listR").on("click", "div.accept", function() {
        accept(this.id);
    });
    $(".listR").on("click", "div.refuse", function() {
        removeRFU(this.id);
    });
});

// View user name
function nameFunc() {
    $.ajax({
        type: 'POST',
        url: '/nameD',						
        success: function(data) {
            $('#display-name').html(data);
            if (window.location.pathname == '/settings') $('#myName').val(data);
        }
    });
}

// Writing new data
function settings(arg) {
    var data = {},
        url = '',
        text;
    if (arg == 1) {
        if ($('#myName').val() != '') {
            data = {name: $('#myName').val()};
            url = '/name';
            text = $('#addName').val();
            $('#addName').val('Wait...');
        }
        else {
            alert('Fill in the blank fields!');
            return false;
        }
    }
    else if (arg == 2) {
        if ($('#city').val() != '' && $('#state').val() != '') {
            data = {city: $('#city').val(), state: $('#state').val()};
            url = '/city';
            text = $('#addCity').val();
            $('#addCity').val('Wait...');
        }
        else {
            alert('Fill in the blank fields!');
            return false;
        }
    }
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            if (data == 'error') alert('Unexpected error!');
            else alert('Data successfully updated!');
            if (url == '/city') $('#addCity').val(text);
            else $('#addName').val(text);
        }
    });
}

// Add new book
function addNew() {
    if ($('#book').val() == '') {
        alert('Fill in the blank fields!');
        return false;
    }
    var data = {book : $('#book').val()},
        text = $('#addBook').val();
    $('#addBook').val('Wait...');
    $.ajax({
        type: 'POST',
        url: '/addBook',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            if (data == 'error') {
                alert('The book was not found!');
                $('#addBook').val(text);
                return false;
            }
            if ($('.list').html() == 'Your list is empty.') $('.list').html('');
            var str = $('.list').html(),
                arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU');
                str += '<div title="' + arr[2] + '" class="list-item"><img class="img" src="' + arr[1] + '" onError="this.src=`/public/img/logo.png`"><div id="' + arr[0] + '" class="remove">X</div></div>';
                $('.list').css({'-webkit-column-count':'7', '-moz-column-count':'7', 'column-count':'7'});
            $('.list').html(str);
            $('#addBook').val(text);
        }
    });
}

// Delete book
function remove(arg) {
    $('#' + arg).parent().css({'opacity':'.3'});
    var data = {id : arg};
    $.ajax({
        type: 'POST',
        url: '/remove',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            $('#' + arg).parent().remove();
            if ($('.list').html() == '') {
                $('.list').css({'-webkit-column-count':'1', '-moz-column-count':'1', 'column-count':'1'});
                $('.list').html('Your list is empty.');
                $('.list').css({'color':'#ffa000'});
            }
        }
    });
}

// Open my list
function openMy() {
    $('.list').css({'-webkit-column-count':'1', '-moz-column-count':'1', 'column-count':'1'});
    $('.list').html('Loading...');
    $.ajax({
        type: 'POST',
        url: '/myList',
        success: function(data) {
            if (data == 'error') {
                $('.list').html('Your list is empty.');
                $('.list').css({'color':'#ffa000'});
                return false;
            }
            else {
                var str = '',
                    arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU');
                for (var i = 0; i < arr.length - 1; i = i + 3)
                    str += '<div title="' + arr[i + 2] + '" class="list-item"><img class="img" src="' + arr[i + 1] + '" onError="this.src=`/public/img/logo.png`"><div title="Remove" id="' + arr[i] + '" class="remove">X</div></div>';
                $('.list').css({'-webkit-column-count':'7', '-moz-column-count':'7', 'column-count':'7'});
                $('.list').html(str);
            }
        }
    });
}

// View list items
function listView() {
    $('.list').css({'-webkit-column-count':'1', '-moz-column-count':'1', 'column-count':'1'});
    $('.list').html('Loading...');
    $.ajax({
        type: 'POST',
        url: '/view',
        success: function(data) {
            var str = '',
                style = '',
                arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU');
            for (var i = 0; i < arr.length - 1; i = i + 3) {
                if (arr[i] != '') style = '<div title="Make a request" id="' + arr[i] + '" class="request">#</div>';
                else style = '';
                str += '<div title="' + arr[i + 2] + '" class="list-item"><img class="img" src="' + arr[i + 1] + '" onError="this.src=`/public/img/logo.png`">' + style + '</div>';
            }
            $('.list').css({'-webkit-column-count':'7', '-moz-column-count':'7', 'column-count':'7'});
            $('.list').html(str);
        }
    });
}

// Request
function request(arg) {
    $('#' + arg).css({'opacity':'.3'});
    var data = {id : arg};
    $.ajax({
        type: 'POST',
        url: '/request',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            $('#' + arg).remove();
        }
    });
}

// View request list
function requestShow() {
    $('.listR').html('Loading...');
    $.ajax({
        type: 'POST',
        url: '/requestShow',
        success: function(data) {
            reqFoUShow();
            var arrB = data.split('#f9B_mn2WZeSvkZZEFEFSFergreZrg#'),
                str = '',
                arr = [];
            if (arrB[0] == '') {
                $('#list1').html('The list is empty.');
                $('#list1').css({'color':'#ffa000'});
            }
            else {
                arr = arrB[0].split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU');
                for (var i = 0; i < arr.length - 1; i = i + 3)
                    str += '<div title="' + arr[i + 2] + '" class="list-item"><img class="img" src="' + arr[i + 1] + '" onError="this.src=`/public/img/logo.png`"><div title="Remove" id="' + arr[i] + '" class="remove">X</div></div>';
                $('#list1').css({'-webkit-column-count':'7', '-moz-column-count':'7', 'column-count':'7'});
                $('#list1').html(str);
            }
            if (arrB[1] == '') {
                $('#list3').html('The list is empty.');
                $('#list3').css({'color':'#ffa000'});
            }
            else {
                str = '';
                arr = arrB[1].split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU');
                for (var i = 0; i < arr.length - 1; i = i + 3)
                    str += '<div title="' + arr[i + 2] + '" class="list-item"><img class="img" src="' + arr[i + 1] + '" onError="this.src=`/public/img/logo.png`"><div title="Remove" id="' + arr[i] + '" class="remove">X</div></div>';
                $('#list3').css({'-webkit-column-count':'7', '-moz-column-count':'7', 'column-count':'7'});
                $('#list3').html(str);
            }
        }
    });
}

// View request for u
function reqFoUShow() {
    $.ajax({
        type: 'POST',
        url: '/reqFoUShow',
        success: function(data) {
            if (data == '') {
                $('#list2').html('The list is empty.');
                $('#list2').css({'color':'#ffa000'});
                return false;
            }
            var arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU'),
                str = '';
            for (var i = 0; i < arr.length - 1; i = i + 3)
                str += '<div title="' + arr[i + 2] + '" class="list-item"><img class="img" src="' + arr[i + 1] + '" onError="this.src=`/public/img/logo.png`"><div title="To accept" id="' + arr[i] + '" class="accept">V</div><div title="Refuse" id="D' + arr[i] + '" class="refuse">X</div></div>';
            $('#list2').css({'-webkit-column-count':'7', '-moz-column-count':'7', 'column-count':'7'});
            $('#list2').html(str);
        }
    });
}

// Delete request
function removeR(arg) {
    $('#' + arg).parent().css({'opacity':'.3'});
    var data = {id : arg};
    $.ajax({
        type: 'POST',
        url: '/removeR',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            $('#' + arg).parent().remove();
        }
    });
}

// Delete request for u
function removeRFU(arg) {
    $('#' + arg).parent().css({'opacity':'.3'});
    var data = {id : arg.substr(1)};
    $.ajax({
        type: 'POST',
        url: '/removeRFU',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            $('#' + arg).parent().remove();
        }
    });
}

// Confirm the request
function accept(arg) {
   $('#' + arg).parent().css({'opacity':'.3'});
    var data = {id : arg};
    $.ajax({
        type: 'POST',
        url: '/confirm',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            $('#' + arg).parent().remove();
        }
    });
}