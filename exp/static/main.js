"use strict";

var budgetCategory;

$(document).ready(loadPage());

$(document).ready(function () {
    $('#date').val('2019-03-25');
});

function loadPage() {
    getBudgetCategories();
}

function findBudgetCategoryById(id) {
    var res;
    budgetCategory.forEach(element => {
        if (element.id == parseInt(id)) {
            res = element;
        }
    });
    return res;
}

function fillCategorySelector() {
    $('#catCol').append(`<select id='bSel' class="form-control" id="catSel"></select>`);
    fillCatSelOptions('bSel')
}

function fillCatSelOptions(id, val = 'last') {
    var lastCategory;
    budgetCategory.forEach(element => {
        $('#' + id).append(`<option value="` + element.id + `">` + element.name + `</option>`);
        lastCategory = element;
    })
    if (val == 'last') {
        $('#' + id).val(lastCategory.id);
        $('#' + id).attr('class', 'form-control ' + (lastCategory.direction == '+' ? 'btn-success' : 'btn-danger'));
    } else {
        $('#' + id).val(val);

    }
    
    $('#' + id).change(function () {
        var newId = $('#' + id).val();
        var bgObj = findBudgetCategoryById(newId);
        $('#' + id).attr('class', 'form-control ' + (bgObj.direction == '+' ? 'btn-success' : 'btn-danger'));
    });
}

function getBudgetCategories() {
    var http = new XMLHttpRequest();
    http.open('get', '/api/budget_group', true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            budgetCategory = JSON.parse(http.responseText);
            fillCategorySelector();
            fillTable();
        }
    }
}

function addBudget() {
    var http = new XMLHttpRequest();
    var postData = JSON.stringify({ date: $('#date').val(), name: $('#name').val(), amount: $('#amount').val(), budget_group_id: $('#bSel').val() });
    http.open('post', '/api/budget', true);
    http.setRequestHeader("Content-type", "application/json");
    http.send(postData);
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 201) {
            $('#name').val('');
            $('#name').focus();
            fillTable();
        } else if (this.readyState == 4 && this.status == 400) {
            alert('Wrong Budget Group');
            $('#name').focus();
        }
    }
}

function fillTable() {
    var http = new XMLHttpRequest();
    $('tbody').empty();
    http.open('get', '/api/budget', true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            fillTableRow(JSON.parse(http.responseText));
        }
    }
}

function fillTableRow(response) {
    var bgObj;
    response.forEach(element => {
        bgObj = findBudgetCategoryById(element.budget_group_id);
        $('tbody').prepend(`<tr id="` + element.id + `">
        <td><input type="date" aria-label="Date" class="form-control col" readonly value="`+ element.date + `"></td>
        <td><input type="text" class="form-control col bgname" readonly value="`+ element.name + `"></td>
        <td>
        <select id="bgSel_`+ element.id + `" class="form-control bgsign ` + (bgObj.direction == '+' ? 'btn-success' : 'btn-danger') + `">
        </select>
        <td><input type="number" aria-label="amount" class="form-control col" readonly value="`+ element.amount + `" step="0.01"></td>
        </td>
        <td style="text-align:center;"><button type="button" onclick="deleteBudget(`+ element.id + `);" class="btn btn-danger">Изтрий</button></td>
        </tr>
        `);
        fillCatSelOptions('bgSel_' + element.id,element.budget_group_id);
    });
}


function deleteBudget(id) {
    var http = new XMLHttpRequest();
    var confirmed = window.confirm('Сигурни ли сте че искате да изтриете записа?');
    if (!confirmed) {
        return false;
    }
    http.open('delete', '/api/budget/' + id, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 204) {
            fillTable();
        }
    }
}

$(document).on('focus', 'input, select', function () {
    $(this).removeAttr('readonly');
    var preValue = $(this).val();
    $(this).focusout(function () {
        var postValue = $(this).val();
        if (preValue != postValue) {
            var id = $(this).closest('tr').attr('id');
            var updated = { name: $('#' + id).find('.bgname').val(), direction: $('#' + id).find('.bgsign').val() };
            //updateBudget(id, updated);
        } else {
            $(this).attr('readonly',true);
        }
    });
});