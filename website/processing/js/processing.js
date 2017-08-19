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

    var clientData = [];
    var clientColumns = ['id','type','startDate','serviceName','clientCode','clientId','therapistName','duration',
        'attendance','fee','charged','taxChared', 'paid', 'taxPaid', 'invoiceId','paymentMethod','comments'];
    var clientKey = 5;
    var sessionKey = 0;
    var skipFirstClientRow = true;
    var masterColumns = ['dateOfReferral','number','name','employer','phone','calls','firstAptDate',
        'dateSentExtReq','dateExtReqApproved','approved','datesSeen','owlId','reason','initials'];
    var masterKey = 11;
    var skipFirstMasterRow = true;

    var currentClientIndex = 0;

    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    // Filters
    var filters = {
        irritating: false,
        extensionRequired: false,
        hidePrivateClients: false
    }

    /**********************************************************************/
    // HANDLE USER CLICKS
    /**********************************************************************/
    $(document).off('click.processsing')
        .on('click.processsing', '.processingInputsButton', function(event) {
            $('#masterKey').css('border-color', '');
            $('#calendarImport').css('border-color', '');
            clientData = [];
            $('.processingInputs textarea').hide();

            currentClientIndex = 0;
            inputClientData();
            inputMasterKey();
            clientData.sort(sortByNumber);
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
            if (currentClientIndex + 1 < clientData.length) {
                currentClientIndex++;
                populateFields(1);
            }
        });

    $(document).off('click.previous')
        .on('click.previous', '.previousClient', function(event) {
            if (currentClientIndex > 0) {
                currentClientIndex--;
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

    $(document).off('click.hideShortSessions')
        .on('click.hideShortSessions', '.hideShortSessions', function(event) {
            if ($('.hideShortSessions:checked').length > 0) {
                $('.shortSession').hide();
            } else {
                $('.shortSession').show();
            }
        });

    $(document).off('click.filterApplier')
        .on('click.filterApplier', '.filterApplier', function(event) {
            filters.irritating = $('.filterIrritating:checked').length > 0;
            filters.extensionRequired = $('.filterExtension:checked').length > 0;
            filters.hidePrivateClients = $('.filterHidePrivate:checked').length > 0;
            $('.filtersContainer').animate({top: '-40rem'}, 500);

            currentClientIndex = 0;
            populateFields(1);
        });

    /**********************************************************************/
    // Start working
    /**********************************************************************/
    function inputClientData() {
        var clientText = $('#calendarImport').val();
        if (clientText.length === 0) {
            $('#calendarImport').css('border-color', 'red');
            return;
        }
        var firstRow = true;
        var data = clientText.split('\n');
        if (data.length < 2) {
            $('#calendarImport').css('border-color', 'red');
            return;
        }
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
                $('#calendarImport').css('border-color', 'red');
                return;
            }
            var newSession = [];
            var i;
            for (i = 0; i < values.length; i++) {
                newSession[clientColumns[i]] = $.trim(values[i]).replace(/\"/g, "");
            }
            var key = values[clientKey];
            var sessionKeyValue = values[sessionKey];
            var newClient = getClientById(key);
            if (newClient === null) {
                newClient = {sessions: {}, sessionCount: 0};
                clientData.push(newClient);
                newClient['clientId'] = newSession['clientId'];
            }
            newClient.sessions[sessionKeyValue] = newSession;
            newClient.sessionCount++;
        });
    }

    function inputMasterKey() {
        var masterText = $('#masterKey').val();
        if (masterText.length === 0) {
            $('#masterKey').css('border-color', 'red');
            return;
        }
        var firstRow = true;
        var data = masterText.split('\n');
        if (data.length < 2) {
            $('#masterKey').css('border-color', 'red');
            return;
        }
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
                $('#masterKey').css('border-color', 'red');
                return;
            }
            var newClient = [];
            var i;
            for (i = 0; i < values.length; i++) {
                var value = $.trim(values[i]).replace(/\"/g, "");
                newClient[masterColumns[i]] = value;
                if (value && value.length > 0 && masterColumns[i] === 'datesSeen') {
                    newClient['datesSeenCount'] = (value.match(/,/g) || []).length + 1;
                }
            }
            var key = values[masterKey];
            var exisingClient = getClientById(key);
            if (exisingClient !== null) {
                newClient = $.extend(exisingClient, exisingClient, newClient);
            } else {
                newClient['clientId'] = newClient['owlId'];
                clientData.push(newClient);
            }
        });
    }

    function sortByNumber(a, b){
        var aNum = a['number'] || 999999999999;
        var bNum = b['number'] || 999999999999;
        if (aNum === 999999999999 && bNum === 999999999999) {
            aNum = a['clientId'];
            bNum = b['clientId'];
        }

        return ((aNum < bNum) ? -1 : ((aNum > bNum) ? 1 : 0));
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
        $('#clientInformation .datesSeenCount').text('0');
        if ((filters.extensionRequired || filters.irritating || filters.hidePrivateClients) && !force) {
            showNext(currentClientIndex, increment);
        } else if (clientData.length > 0) {
            var content = $('.content');
            content.fadeTo(100, 0.5, function() {
                var nextClientData = clientData[currentClientIndex];
                var i;
                $('.clientId').text('Client (OWL) Id: ' + nextClientData['clientId']);
                $('.mOfn').text((currentClientIndex + 1) + ' of ' + clientData.length);

                for (i = 0; i < masterColumns.length; i++) {
                    var fld = $('#' + masterColumns[i]);
                    var val = nextClientData[masterColumns[i]];
                    var date = new Date(val);
                    if (!!date && date.getFullYear() > 2013 && (val.indexOf('-') > 0 || val.indexOf('/') > 0)) {
                        val = getDateString(date) + ' (' + val + ')';
                    }
                    fld.val(val);
                    if (!nextClientData[masterColumns[i]] || nextClientData[masterColumns[i]].length === 0) {
                        fld.addClass('invalidData');
                    } else {
                        fld.removeClass('invalidData');
                    }
                }
                var table = $('table');
                clearTable(table);
                if (nextClientData.sessions) {
                    $.each(nextClientData.sessions, function (index) {
                        addRow(table, this, nextClientData['employer'], nextClientData['dateSentExtReq'],
                            nextClientData['dateExtReqApproved'], nextClientData['number']);
                    });
                    if ($('.hideShortSessions:checked').length === 0) {
                        $('.shortSession').show();
                    }
                }
                $('#clientInformation .datesSeenCount').text(nextClientData['datesSeenCount']);

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
        var row = $('<tr class="' + (sessionData['duration'] < 49 ? 'shortSession' : '') + '">');
        table.append(row);
        addCell(row, getDateString(new Date(sessionData['startDate'])));
        addCell(row, employer);
        addCell(row, number);
        addCell(row, (sessionData['attendance'] === 'No Show' ? '<b>√</b>' : ''));
        addCell(row, sessionData['duration']);
        addCell(row, extApproved);
        addCell(row, '');
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
        var nextClient = clientData[index];
        var foundHit = (!filters.irritating || isIrritating(nextClient));
        foundHit = foundHit && (!filters.extensionRequired || isRequireExtension(nextClient));
        foundHit = foundHit && (!filters.hidePrivateClients || isPrivateClient(nextClient));

        if (foundHit) {
            currentClientIndex = index;
            populateFields(nextClient, true);
        } else {
            if (index + direction < 0 || index + direction >= clientData.length) {
                alert('Mo more clients that match your filter choices were found.');
                return;
            }
            showNext(index + direction, direction);
        }
    }

    function isRequireExtension(theClient) {
        return (theClient.sessionCount >= 3 &&
        (!theClient['dateExtReqApproved'] || theClient['dateExtReqApproved'].length === 0) &&
        (!theClient['approved'] || theClient['approved'].length === 0));
    }

    function isPrivateClient(theClient) {
        return (typeof theClient['number'] !== 'undefined');
    }

    function isIrritating(theClient) {
        var irritating = false;
        if (theClient.sessions) {
            $.each(theClient.sessions, function (index) {
                if (this['paid'] === '0.00' || this['attendance'] === 'No Show') {
                    irritating = true;
                    return;
                }
            });
        }

        return irritating;
    }

    function getDateString(date) {
        return MONTHS[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }

    function getClientById(id) {
        var i;
        for (i = 0; i < clientData.length; i++) {
            if (clientData[i]['clientId'] === id) {
                return clientData[i];
            }
        }

        return null;
    }

})(window);