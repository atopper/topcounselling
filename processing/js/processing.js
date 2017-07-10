/*************************************************************************
 *
 * TOP COUNSELLING CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2017 TOP COUNSELLING
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Top Counselling and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Top Counselling and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Top Counselling.
 **************************************************************************/
;

(function(window, undefined) {

    var clientData = {count: 0};
    var clientColumns = ['id','type','startDate','serviceName','clientCode','clientId','therapistName','duration',
        'attendance','fee','charged','paid','invoiceId','paymentMethod','comments'];
    var clientKey = 5;
    var sessionKey = 0;
    var skipFirstClientRow = true;
    var masterColumns = ['dateOfReferral','number','name','employer','phone','reason','calls','firstAptDate',
        'dateSentExtReq','dateExtReqApproved','approved','datesSeen'];
    var masterKey = 2;
    var skipFirstMasterRow = false;

    var currentClientIndex = 0;

    // Filters
    var filters = {
        irritating: false,
        extensionRequired: false
    }

    $(document).off('click.processsing')
        .on('click.processsing', '.processingInputsButton', function(event) {
            clientData = {count: 0};
            $('.processingInputs textarea').hide();

            currentClientIndex = 0;
            inputClientData();
            inputMasterKey();
            populateFields(1);
        });

    $(document).off('click.processsingReset')
        .on('click.processsingReset', '.processingInputsReset', function(event) {
            $('.content').fadeOut(200, function() {
                $('.processingInputs textarea').fadeIn(300);
            });
            currentClientIndex = 0;
        });

    $(document).off('click.next')
        .on('click.next', '.nextClient', function(event) {
            if (currentClientIndex + 1 < clientData.count) {
                if (!filters.extensionRequired || !filters.irritating) {
                    currentClientIndex++;
                }
                populateFields(1);
            }
        });

    $(document).off('click.previous')
        .on('click.previous', '.previousClient', function(event) {
            if (currentClientIndex > 0) {
                if (!filters.extensionRequired || !filters.irritating) {
                    currentClientIndex--;
                }
                populateFields(-1);
            }
        });

    $(document).off('click.first')
        .on('click.first', '.firstClient', function(event) {
            currentClientIndex = 0;
            populateFields(1);
        });

    $(document).off('click.filterActivator')
        .on('click.filterActivator', '.filterActivator', function(event) {
            var filtersContainer = $('.filtersContainer');
            if (filtersContainer.position().top < 0) {
                filtersContainer.animate({top: '3rem'}, 500);
            }
        });

    $(document).off('click.filterApplier')
        .on('click.filterApplier', '.filterApplier', function(event) {
            filters.irritating = $('.filterIrritating:checked').length > 0;
            filters.extensionRequired = $('.filterExtension:checked').length > 0;
            $('.filtersContainer').animate({top: '-40rem'}, 500);

            currentClientIndex = 0;
            populateFields(1);
        });

    function inputClientData() {
        var clientText = $('#calendarImport').val();
        if (clientText.length === 0) {
            return;
        }
        var firstRow = true;
        var data = clientText.split('\n');
        $.each(data, function() {
            if (firstRow) {
                firstRow = false;
                if (skipFirstClientRow) {
                    return;
                }
            }
            var values = commaDelimitedQuotes(this);
            if (values.length === 1) {
                return;
            }
            if (values.length !== clientColumns.length) {
                console.log('Client ' + values[0] + ' does not seem to have enough columns.  Expected ' + clientColumns.length + ' but got ' + values.length + '. Skipping it.');
                console.log(JSON.stringify(this));
                return;
            }
            var newSession = [];
            var i;
            for (i = 0; i < values.length; i++) {
                newSession[clientColumns[i]] = $.trim(values[i]).replace(/\"/g, "");
            }
            var key = values[clientKey];
            var sessionKeyValue = values[sessionKey];
            if (!clientData[key]) {
                clientData.count++;
                clientData[key] = {sessions: {}, sessionCount: 0};
            }
            clientData[key].sessionCount++;
            clientData[key].sessions[sessionKeyValue] = newSession;
            clientData[key]['clientId'] = newSession['clientId'];
        });
    }

    function inputMasterKey() {
        var masterText = $('#masterKey').val();
        if (masterText.length === 0) {
            return;
        }
        var firstRow = true;
        var data = masterText.split('\n');
        $.each(data, function() {
            if (firstRow) {
                firstRow = false;
                if (skipFirstMasterRow) {
                    return;
                }
            }
            var values = commaDelimitedQuotes(this);
            if (values.length === 1) {
                return;
            }
            if (values.length !== masterColumns.length) {
                console.log('Master ' + values[0] + ' does not seem to have enough columns.  Expected ' + masterColumns.length + ' but got ' + values.length + '. Skipping it.');
                console.log(JSON.stringify(this));
                return;
            }
            var newClient = [];
            var i;
            for (i = 0; i < values.length; i++) {
                newClient[masterColumns[i]] = $.trim(values[i]).replace(/\"/g, "");
            }
            var key = values[masterKey];
            if (clientData[key]) {
                clientData[key] = $.extend(clientData[key], clientData[key], newClient);
            } else {
                clientData[key] = newClient;
            }
        });
    }

    function commaDelimitedQuotes(theLine) {
        var result = [];
        result[0] = '';
        var fldCount = 0;
        var inQuote = false;
        var i;
        for (i = 0; i < theLine.length; i++) {
            if (theLine[i] === '"') {
                inQuote = !inQuote;
            } else if (theLine[i] === ',') {
                if (inQuote) {
                    result[fldCount] += theLine[i];
                } else {
                    fldCount++;
                    result[fldCount] = '';
                }
            } else {
                result[fldCount] += theLine[i];
            }
        }

        return result;
    }

    function createFields(masterSel, fieldNames, data) {
        var i;
        var column1 = $(masterSel).find('.column1');
        var column2 = $(masterSel).find('.column2');
        var col = column1;
        for (i = 0; i < fieldNames.length; i++) {
            if (i % 2 === 0) {
                col = column1;
            } else {
                col = column2;
            }
            $(col).append($('<span id="' + fieldNames[i] + '"></span>'));
            $('#' + fieldNames[i]).text = data[fieldNames[i]];
        }
    }

    function populateFields(increment, force) {
        if ((filters.extensionRequired || filters.irritating) && !force) {
            showNext(currentClientIndex, increment);
        } else {
            var content = $('.content');
            content.fadeTo(100, 0.5, function() {
                var nextClientData = clientData[Object.keys(clientData)[currentClientIndex]];
                var i;
                $('.clientId').text('Client Id: ' + nextClientData['clientId'] + ' (' + (currentClientIndex + 1) + ' of ' + (Object.keys(clientData).length - 1) + ')');

                for (i = 0; i < masterColumns.length; i++) {
                    var fld = $('#' + masterColumns[i]);
                    fld.val(nextClientData[masterColumns[i]]);
                    if (!nextClientData[masterColumns[i]] || nextClientData[masterColumns[i]].length === 0) {
                        fld.addClass('invalidData');
                    } else {
                        fld.removeClass('invalidData');
                    }
                }
                var table = $('table');
                clearTable(table);
                $.each(nextClientData.sessions, function (index) {
                    addRow(table, this, nextClientData['employer'], nextClientData['dateSentExtReq'],
                        nextClientData['dateExtReqApproved'], nextClientData['number']);
                });

                content.fadeTo(100, 1);
            })
        }
    }

    function clearTable(table) {
        while (table.find('tr').length > 2) {
            table.find('tr:last').remove();
        }
    }

    function addRow(table, sessionData, employer, extReq, extApproved, number) {
        var row = $('<tr>');
        table.append(row);
        addCell(row, sessionData['startDate']);
        addCell(row, employer);
        addCell(row, number);
        addCell(row, (sessionData['attendance'] === 'No Show' ? '<b>√</b>' : ''));
        addCell(row, sessionData['duration']);
        addCell(row, extReq);
        addCell(row, extApproved);
        addCell(row, sessionData['fee'], false);
        addCell(row, sessionData['charged'], false);
        addCell(row, sessionData['paid'], false);
    }

    function addCell(row, value, center) {
        if (typeof value === 'undefined') {
            row.append($('<td class="invalidData"></td>'));
        } else if (center) {
            row.append($('<td style="text-align:center">' + unit + value + '</td>'));
        } else {
            row.append($('<td>' + value + '</td>'));
        }
    }

    function showNext(index, direction) {
        if (index + direction < 0 || index + direction >= clientData.count) {
            alert('No matching clients were found.');
            return;
        }
        index += direction;
        var nextClient = clientData[Object.keys(clientData)[index]];
        var foundHit = (!filters.irritating || isIrritating(nextClient));
        foundHit = foundHit && (!filters.extensionRequired || isRequireExtension(nextClient));

        if (foundHit) {
            currentClientIndex = index;
            populateFields(nextClient, true);
        } else {
            showNext(index, direction);
        }
    }

    function isRequireExtension(theClient) {
        return (theClient.sessionCount >= 3 &&
        (!theClient['dateExtReqApproved'] || theClient['dateExtReqApproved'].length === 0) &&
        (!theClient['approved'] || theClient['approved'].length === 0));
    }

    function isIrritating(theClient) {
        var irritating = false;
        $.each(theClient.sessions, function(index) {
            if (this['paid'] === '0.00' || this['attendance'] === 'No Show') {
                irritating = true;
                return;
            }
        })

        return irritating;
    }

})(window);