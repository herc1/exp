"use strict";

var budgetCategory;

$(document).ready(loadPage());

function loadPage() {
    fillRTable();
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
    $('#budget').empty();
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
        $('#budget').prepend(`<tr id="` + element.id + `">
        <td><input type="date" aria-label="Date" class="form-control col date" readonly value="`+ element.date + `"></td>
        <td><input type="text" class="form-control col bname" readonly value="`+ element.name + `"></td>
        <td>
        <select id="bgSel_`+ element.id + `" class="form-control bg-id ` + (bgObj.direction == '+' ? 'btn-success' : 'btn-danger') + `">
        </select>
        <td><input type="number" aria-label="amount" class="form-control col amount" readonly value="`+ element.amount + `" step="0.01"></td>
        </td>
        <td style="text-align:center;"><button type="button" onclick="deleteBudget(`+ element.id + `);" class="btn btn-danger">Изтрий</button></td>
        </tr>
        `);
        fillCatSelOptions('bgSel_' + element.id, element.budget_group_id);
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

$(document).on('focus', '.date, .bname, .bg-id, .amount', function () {
    $(this).removeAttr('readonly');
    var preValue = $(this).val();
    $(this).focusout(function () {
        var postValue = $(this).val();
        if (preValue != postValue) {
            var id = $(this).closest('tr').attr('id');
            var updated = {
                date: $('#' + id).find('.date').val(), name: $('#' + id).find('.bname').val(), budget_group_id: $('#bgSel_' + id).val(), amount: $('#' + id).find('.amount').val()
            };
            updateBudget(id, updated);
        } else {
            $(this).attr('readonly', true);
        }
    });
});

function updateBudget(id, bObj) {
    var http = new XMLHttpRequest();
    http.open('put', '/api/budget/' + id, true);
    http.setRequestHeader("Content-type", "application/json");
    http.send(JSON.stringify(bObj));
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 201) {
            fillTable();
        } else if (this.readyState == 4 && this.status != 201) {
            alert('Няма такъв запис в бюджета');
        }
    }
}

function addReal() {
    var http = new XMLHttpRequest();
    var postData = JSON.stringify({ name: $('#rName').val(), amount: $('#rAmount').val() });
    http.open('post', '/api/real', true);
    http.setRequestHeader("Content-type", "application/json");
    http.send(postData);
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 201) {
            $('#rName').val('');
            $('#rName').focus();
            fillRTable();
        }
    }
}

function fillRTable() {
    var http = new XMLHttpRequest();
    $('#real').empty();
    http.open('get', '/api/real', true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            fillRTableRow(JSON.parse(http.responseText));
        }
    }
}


function fillRTableRow(response) {
    response.forEach(element => {
        $('#real').prepend(`<tr id="` + element.id + `">
        <td><input type="text" class="form-control col rName" readonly value="`+ element.name + `"></td>
        <td><input type="number" aria-label="amount" class="form-control col rAmount" readonly value="`+ element.amount + `" step="0.01"></td>
        </td>
        <td style="text-align:center;"><button type="button" onclick="deleteReal(`+ element.id + `);" class="btn btn-danger">Изтрий</button></td>
        </tr>
        `)
    });
    var realTotal = 0;
    $(".rAmount").each(function () {
        realTotal += parseFloat($(this).val());
    });
    $('#real').append(`<tr>
        <td>Реалност Общо</td>
        <td>`+ realTotal.toFixed(2) + `</td>
        <td></td>
        </tr>`)

    var http = new XMLHttpRequest();
    http.open('get', '/api/balance', true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var calculated_balance = JSON.parse(http.responseText);
            console.log(calculated_balance);
            $('#real').append(`<tr>
            <td>Калкулиран Баланс</td>
            <td id="balance">`+ calculated_balance + `</td>
            <td></td>
            </tr>`);
        }
    }
}

function deleteReal(id) {
    var http = new XMLHttpRequest();
    var confirmed = window.confirm('Сигурни ли сте че искате да изтриете записа?');
    if (!confirmed) {
        return false;
    }
    http.open('delete', '/api/real/' + id, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 204) {
            fillRTable();
        }
    }
}

$(document).on('focus', '.rName, .rAmount', function () {
    $(this).removeAttr('readonly');
    var preValue = $(this).val();
    $(this).focusout(function () {
        var postValue = $(this).val();
        if (preValue != postValue) {
            var id = $(this).closest('tr').attr('id');
            var updated = {
                name: $('#' + id).find('.rName').val(), amount: $('#' + id).find('.rAmount').val()
            };
            updateReal(id, updated);
        } else {
            $(this).attr('readonly', true);
        }
    });
});

function updateReal(id, rObj) {
    var http = new XMLHttpRequest();
    http.open('put', '/api/real/' + id, true);
    http.setRequestHeader("Content-type", "application/json");
    http.send(JSON.stringify(rObj));
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 201) {
            fillRTable();
        }
    }
}