const { env } = require("./env");
const { entries, glCode } = require("./multiple-transaction-data");
// const { entries, glCode} = require("./multiple-transaction-data");

describe('Multiple Transaction Entry', function () {
    beforeEach(function () {
        cy.visit('http://192.168.1.172:56080');
        cy.url({ timeout: 10000 }).should('eq', `${env.baseUrl}/login`);
        cy.get('[placeholder="Type your username"]').type(env.username);
        cy.get('[placeholder="Type your password"]').type(env.password);
        cy.get('[class="login-form-btn"]').contains('Login').click();
        cy.url({ timeout: 10000 }).should('eq', `${env.baseUrl}/#/menu`);
    })

    it('Multiple Transaction Entry', function () {

        cy.visit(env.baseUrl + '/batch-transaction/#/multiple-transaction/create');

        //function for Account Information
        function accountInformation(entryType, index, glCode) {
            const entry = entries[`${entryType}`][index];
            const transactionCode = entry.Debit !== 0 ? 'GL Debit' : 'GL Credit';
            // Select Transaction Code
            cy.get('[placeholder="Transaction Code"]').first().click();
            cy.wait(1000);
            cy.get('[placeholder="Transaction Code"]').first().type(transactionCode);
            cy.wait(1500);
            cy.get('[placeholder="Transaction Code"]').first().type('{downarrow}{downarrow}{enter}');
            cy.wait(1000);

            // Select Transaction Particular Code
            cy.get('[placeholder="Transaction Particular Code"]').first().click();
            cy.wait(500);
            cy.get('[placeholder="Transaction Particular Code"]').first().type('CASH RECEIVE');
            cy.wait(500);
            cy.get('[placeholder="Transaction Particular Code"]').first().type('{downarrow}{downarrow}{enter}');
            cy.wait(1000);

            // Select GL Code
            cy.get('.ui-g-6 > .md-inputfield > .tabIndex').click().type(glCode);
            cy.wait(1000);
            cy.get('.ui-g-6 > .md-inputfield > .tabIndex').type('{downarrow}{downarrow}{enter}');
            cy.wait(1000);
        }

        //Function for Transaction Information
        function transactionInformation(entryType, index) {
            const entry = entries[`${entryType}`][index];
            const amount = entry.Debit !== 0 ? entry.Debit : entry.Credit;
            // Enter Reference Amount
            cy.get('[formcontrolname="referenceCurrencyAmount"]').type(amount).type('{enter}');
            // Enter Narration
            cy.get('[formcontrolname="narration"]').type('ABC');
        }


        //Function for Click Add and Wait
        function addAndWait(originatingBranchId, respondingBranchId, index) {
            // Intercept the GET request
            cy.intercept('GET', `/ababil-batch-transaction/multi-transaction/unreconciled-advices?originatingBranchId=${originatingBranchId}&respondingBranchId=${respondingBranchId}`).as('add');

            // Click Add
            cy.get('[label="Add"]').contains('Add').click();

            // Wait and handle the intercepted request
            cy.wait(1000);
            cy.wait('@add').then((interception) => {
                let addResponseStatus = interception.response.statusCode;

                if (addResponseStatus >= 200 && addResponseStatus < 300) {
                    cy.log(`Entry at index ${index} completed successfully.`);
                    console.log(`Entry at index ${index} completed successfully.`);
                }
            });
        }

        //Function for IBTA Information
        function ibtaInformation(entryType, index) {
            const entry = entries[`${entryType}`][index];
            // Clicking on RESPONDING Tab
            cy.get('.ui-clickable').contains('RESPONDING').click();
            // Wait after clicking RESPONDING Tab
            cy.wait(1000);

            // Click originatingBranchId
            cy.get('[formcontrolname="originatingBranchId"]').click();

            // Writing originatingBranchId
            cy.get(':nth-child(2) > .md-inputfield-2 > .ui-inputwrapper-filled > .ui-dropdown > .ui-dropdown-panel > .ui-dropdown-filter-container > .ui-dropdown-filter')
                .click()
                .type(entry.BranchCode)
                .type('{downarrow}{enter}');

            // Wait after inputting originatingBranchId
            cy.wait(500);

            // Selecting Advice Number
            cy.get('.ui-g-12.ng-invalid > :nth-child(1) > :nth-child(3) > .md-inputfield-2 > .ui-inputwrapper-filled > .ui-dropdown > .ui-dropdown-label').click();
            cy.get(':nth-child(3) > .md-inputfield-2 > .ui-inputwrapper-filled > .ui-dropdown > .ui-dropdown-panel > .ui-dropdown-filter-container > .ui-dropdown-filter')
                .type(entry.AdviceNumber);

            // Wait
            cy.wait(500);
            cy.get('.ui-g-12.ng-invalid > :nth-child(1) > :nth-child(3) > .md-inputfield-2').type('{downarrow}{enter}');

            // Select Transaction Particular ibtaTrCode
            cy.get('[formcontrolname="ibtaTrCode"]').click().type('{downarrow}{downarrow}{enter}');
        }


        entries.entries.forEach((entry, index) => {
            const entryType = 'entries';

            accountInformation(entryType, index, glCode.glCode);
            transactionInformation(entryType, index);
            ibtaInformation(entryType, index)
            addAndWait(18, 18, index);
        });

        entries.reverseEntries.forEach((entry, index) => {
            const entryType = 'reverseEntries';
            accountInformation(entryType, index, glCode.reverseGlCode);
            transactionInformation(entryType, index);
            addAndWait(18, 18, index);
        })
    });
});
