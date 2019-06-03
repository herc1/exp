"use strict";
var http = new XMLHttpRequest();

$(document).ready(fillTable());

$(document).ready(function () {
    $('select').change(function () {
        if ($('select').val() == '-') {
            $(this).attr('class', 'form-control btn-danger')
        } else {
            $(this).attr('class', 'form-control btn-success')
        }
    });
});

$(document).on('focus', 'input, select', function () {
    $(this).removeAttr('readonly');
    console.log('test');
    var preValue = $(this).val();
    $(this).focusout(function () {
        var postValue = $(this).val();
        if (preValue != postValue) {
            var id = $(this).closest('tr').attr('id');
            var updated = { name: $('#' + id).find('.bgname').val(), direction: $('#' + id).find('.bgsign').val() };
            updateBudgetGroup(id, updated);
        } else {
            $(this).attr('readonly',true);
        }
    });
});

function fillTableRow(response) {
    var bG = JSON.parse(http.responseText)
    bG.forEach(element => {
        $('tbody').prepend(`<tr id="` + element.id + `">
        <td><input type="text" class="form-control col bgname" readonly value="`+ element.name + `"></td>
        <td>
        <select id="direction" class="form-control bgsign `+ (element.direction == '+' ? 'btn-success' : 'btn-danger') + `">` +
            (element.direction == '+' ? '<option value="+">+</option><option value="-">-</option>' : '<option value="-">-</option><option value="+">+</option>') + ` 
        </select>
        </td>
        <td style="text-align:center;"><button type="button" onclick="deleteBudgetGroup(`+ element.id + `);" class="btn btn-danger">Изтрий</button></td>
        </tr>
        `);
    });
}

function fillTable() {
    $('tbody').empty();
    http.open('get', '/api/budget_group', true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            fillTableRow();
        }
    }
}

function addBudgetGroup() {
    var postData = JSON.stringify({ name: $('#name').val(), direction: $('#direction').val() });
    http.open('post', '/api/budget_group', true);
    http.setRequestHeader("Content-type", "application/json");
    http.send(postData);
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 201) {
            $('#name').val('');
            $('#name').focus();
            fillTable();
        } else if (this.readyState == 4 && this.status == 400) {
            alert('Record duplicated');
            $('#name').focus();
        }
    }
}

function deleteBudgetGroup(id) {
    var confirmed = window.confirm('Сигурни ли сте че искате да изтриете записа?');
    if (!confirmed) {
        return false;
    }
    http.open('delete', '/api/budget_group/' + id, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 204) {
            fillTable();
        } else if (this.readyState == 4 && this.status != 204) {
            alert('Не можете да изтриете този запис. Проверете за записи в бюджета, използващи това перо!');
        }
    }
}

function updateBudgetGroup(id, bg) {
    http.open('put', '/api/budget_group/' + id, true);
    http.setRequestHeader("Content-type", "application/json");
    http.send(JSON.stringify(bg));
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 201) {
            fillTable();
        } else if (this.readyState == 4 && this.status != 400) {
            alert('Такова бюджетно перо вече съществува!');
        }
    }
}