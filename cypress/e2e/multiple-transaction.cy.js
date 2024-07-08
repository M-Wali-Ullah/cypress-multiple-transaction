const { env } = require("./env");
const { entries } = require("./multiple-transaction-data.");

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
        cy.visit(Cypress.env('baseUrl') + '/batch-transaction/#/multiple-transaction/create');
        entries.entries.forEach((entry, index) => {
            // Determine Transaction Code
            const transactionCode = entries.entries[index].Debit !== 0 ? 'GL Debit' : 'GL Credit';
            // Determine amount
            const amount = entries.entries[index].Debit !== 0 ? entries.entries[index].Debit : entries.entries[index].Credit;

            //Select Transaction Code
            cy.get('[placeholder="Transaction Code"]').first().click();
            //Wait
            cy.wait(1000);
            cy.get('[placeholder="Transaction Code"]').first().type(transactionCode);
            //Wait
            cy.wait(1500);
            cy.get('[placeholder="Transaction Code"]').first().type('{downarrow}{downarrow}{enter}');
            //Wait
            cy.wait(1000);

            //Select Transaction Particular Code
            cy.get('[placeholder="Transaction Particular Code"]').first().click();
            //Wait
            cy.wait(500);
            cy.get('[placeholder="Transaction Particular Code"]').first().type('CASH RECEIVE');
            //Wait
            cy.wait(500);
            cy.get('[placeholder="Transaction Particular Code"]').first().type('{downarrow}{downarrow}{enter}');
            //Wait
            cy.wait(1000);

            //Select GL Code
            cy.get('.ui-g-6 > .md-inputfield > .tabIndex').click().type('206010001');
            //Wait
            cy.wait(1000);
            cy.get('.ui-g-6 > .md-inputfield > .tabIndex').type('{downarrow}{downarrow}{enter}');
            //Wait after inputting GL code
            cy.wait(1000);

            //Clicking on RESPONDING Tab
            cy.get('.ui-clickable').contains('RESPONDING').click();
            //Wait clicking RESPONDING Tab
            cy.wait(1000);

            //Click originatingBranchId
            cy.get('[formcontrolname="originatingBranchId"]').click();

            //Writing originatingBranchId
            cy.get(':nth-child(2) > .md-inputfield-2 > .ui-inputwrapper-filled > .ui-dropdown > .ui-dropdown-panel > .ui-dropdown-filter-container > .ui-dropdown-filter').click();
            cy.get(':nth-child(2) > .md-inputfield-2 > .ui-inputwrapper-filled > .ui-dropdown > .ui-dropdown-panel > .ui-dropdown-filter-container > .ui-dropdown-filter').type(entries.entries[index].BranchCode).type('{downarrow}{enter}');

            //Wait clicking inputting originatingBranchId
            cy.wait(500);
            //Selecting Advice Number
            cy.get('.ui-g-12.ng-invalid > :nth-child(1) > :nth-child(3) > .md-inputfield-2 > .ui-inputwrapper-filled > .ui-dropdown > .ui-dropdown-label').click();
            cy.get(':nth-child(3) > .md-inputfield-2 > .ui-inputwrapper-filled > .ui-dropdown > .ui-dropdown-panel > .ui-dropdown-filter-container > .ui-dropdown-filter').type(entries.entries[index].AdviceNumber);
            //Wait
            cy.wait(500);
            cy.get('.ui-g-12.ng-invalid > :nth-child(1) > :nth-child(3) > .md-inputfield-2').type('{downarrow}{enter}');

            //Select Transaction Particular ibtaTrCode
            cy.get('[formcontrolname="ibtaTrCode"]').click().type('{downarrow}{downarrow}{enter}')

            //Enter Reference Amount
            cy.get('[formcontrolname="referenceCurrencyAmount"]').type(amount).type('{enter}');

            //Narration
            cy.get('[formcontrolname="narration"]').type('ABC');

            cy.intercept('GET', `/ababil-batch-transaction/multi-transaction/unreconciled-advices?originatingBranchId=18&respondingBranchId=18`).as('add');
            //Click Add
            cy.get('[label="Add"]').contains('Add').click();

            //wait
            cy.wait(1000);
            cy.wait('@add')
                .then((interception) => {
                    let addResponseStatus;
                    addResponseStatus = interception.response.statusCode;

                    if (addResponseStatus >= 200 && addResponseStatus < 300) {
                        cy.log(`Entry at index ${index} completed successfully.`);
                        console.log(`Entry at index ${index} completed successfully.`);
                    }
                });
        });
    });
});
