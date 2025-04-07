import { relations } from "drizzle-orm/relations";
import { users, activities, userSubscriptions, subscriptionPackages, socialIntegrations, socialCampaigns, socialMessages, leads, contacts, events, tasks, accounts, opportunities, productCategoriesTable, products, inventoryTransactions, invoices, invoiceItems, purchaseOrders, purchaseOrderItems, proposalTemplates, proposalElements, proposals, proposalCollaborators, proposalComments, proposalActivities } from "./schema";

export const activitiesRelations = relations(activities, ({one}) => ({
        user: one(users, {
                fields: [activities.userId],
                references: [users.id]
        }),
}));

export const usersRelations = relations(users, ({many}) => ({
        activities: many(activities),
        userSubscriptions: many(userSubscriptions),
        socialIntegrations: many(socialIntegrations),
        socialCampaigns: many(socialCampaigns),
        events: many(events),
        tasks: many(tasks),
        opportunities: many(opportunities),
        leads: many(leads),
        contacts: many(contacts),
        productCategories: many(productCategoriesTable),
        products: many(products),
        inventoryTransactions: many(inventoryTransactions),
        invoices: many(invoices),
        purchaseOrders_createdBy: many(purchaseOrders, {
                relationName: "purchaseOrders_createdBy_users_id"
        }),
        purchaseOrders_approvedBy: many(purchaseOrders, {
                relationName: "purchaseOrders_approvedBy_users_id"
        }),
        proposalTemplates: many(proposalTemplates),
        proposalElements: many(proposalElements),
        proposals: many(proposals),
        proposalCollaborators_userId: many(proposalCollaborators, {
                relationName: "proposalCollaborators_userId_users_id"
        }),
        proposalCollaborators_addedBy: many(proposalCollaborators, {
                relationName: "proposalCollaborators_addedBy_users_id"
        }),
        proposalComments_userId: many(proposalComments, {
                relationName: "proposalComments_userId_users_id"
        }),
        proposalComments_resolvedBy: many(proposalComments, {
                relationName: "proposalComments_resolvedBy_users_id"
        }),
        proposalActivities: many(proposalActivities),
        accounts: many(accounts),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({one}) => ({
        user: one(users, {
                fields: [userSubscriptions.userId],
                references: [users.id]
        }),
        subscriptionPackage: one(subscriptionPackages, {
                fields: [userSubscriptions.packageId],
                references: [subscriptionPackages.id]
        }),
}));

export const subscriptionPackagesRelations = relations(subscriptionPackages, ({many}) => ({
        userSubscriptions: many(userSubscriptions),
}));

export const socialIntegrationsRelations = relations(socialIntegrations, ({one, many}) => ({
        user: one(users, {
                fields: [socialIntegrations.userId],
                references: [users.id]
        }),
        socialCampaigns: many(socialCampaigns),
        socialMessages: many(socialMessages),
}));

export const socialCampaignsRelations = relations(socialCampaigns, ({one}) => ({
        socialIntegration: one(socialIntegrations, {
                fields: [socialCampaigns.integrationId],
                references: [socialIntegrations.id]
        }),
        user: one(users, {
                fields: [socialCampaigns.ownerId],
                references: [users.id]
        }),
}));

export const socialMessagesRelations = relations(socialMessages, ({one}) => ({
        socialIntegration: one(socialIntegrations, {
                fields: [socialMessages.integrationId],
                references: [socialIntegrations.id]
        }),
        lead: one(leads, {
                fields: [socialMessages.leadId],
                references: [leads.id]
        }),
        contact: one(contacts, {
                fields: [socialMessages.contactId],
                references: [contacts.id]
        }),
}));

export const leadsRelations = relations(leads, ({one, many}) => ({
        socialMessages: many(socialMessages),
        user: one(users, {
                fields: [leads.ownerId],
                references: [users.id]
        }),
        contact: one(contacts, {
                fields: [leads.convertedToContactId],
                references: [contacts.id]
        }),
        account: one(accounts, {
                fields: [leads.convertedToAccountId],
                references: [accounts.id]
        }),
        opportunity: one(opportunities, {
                fields: [leads.convertedToOpportunityId],
                references: [opportunities.id]
        }),
}));

export const contactsRelations = relations(contacts, ({one, many}) => ({
        socialMessages: many(socialMessages),
        leads: many(leads),
        account: one(accounts, {
                fields: [contacts.accountId],
                references: [accounts.id]
        }),
        user: one(users, {
                fields: [contacts.ownerId],
                references: [users.id]
        }),
        invoices: many(invoices),
}));

export const eventsRelations = relations(events, ({one}) => ({
        user: one(users, {
                fields: [events.ownerId],
                references: [users.id]
        }),
}));

export const tasksRelations = relations(tasks, ({one}) => ({
        user: one(users, {
                fields: [tasks.ownerId],
                references: [users.id]
        }),
}));

export const opportunitiesRelations = relations(opportunities, ({one, many}) => ({
        account: one(accounts, {
                fields: [opportunities.accountId],
                references: [accounts.id]
        }),
        user: one(users, {
                fields: [opportunities.ownerId],
                references: [users.id]
        }),
        leads: many(leads),
        proposals: many(proposals),
}));

export const accountsRelations = relations(accounts, ({one, many}) => ({
        opportunities: many(opportunities),
        leads: many(leads),
        contacts: many(contacts),
        invoices: many(invoices),
        purchaseOrders: many(purchaseOrders),
        proposals: many(proposals),
        user: one(users, {
                fields: [accounts.ownerId],
                references: [users.id]
        }),
}));

export const productCategoriesRelations = relations(productCategoriesTable, ({one, many}) => ({
        productCategory: one(productCategoriesTable, {
                fields: [productCategoriesTable.parentId],
                references: [productCategoriesTable.id],
                relationName: "productCategories_parentId_productCategories_id"
        }),
        productCategories: many(productCategoriesTable, {
                relationName: "productCategories_parentId_productCategories_id"
        }),
        user: one(users, {
                fields: [productCategoriesTable.ownerId],
                references: [users.id]
        }),
        products: many(products),
}));

export const productsRelations = relations(products, ({one, many}) => ({
        productCategory: one(productCategoriesTable, {
                fields: [products.categoryId],
                references: [productCategoriesTable.id]
        }),
        user: one(users, {
                fields: [products.ownerId],
                references: [users.id]
        }),
        inventoryTransactions: many(inventoryTransactions),
        invoiceItems: many(invoiceItems),
        purchaseOrderItems: many(purchaseOrderItems),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({one}) => ({
        product: one(products, {
                fields: [inventoryTransactions.productId],
                references: [products.id]
        }),
        user: one(users, {
                fields: [inventoryTransactions.createdBy],
                references: [users.id]
        }),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
        account: one(accounts, {
                fields: [invoices.accountId],
                references: [accounts.id]
        }),
        contact: one(contacts, {
                fields: [invoices.contactId],
                references: [contacts.id]
        }),
        user: one(users, {
                fields: [invoices.ownerId],
                references: [users.id]
        }),
        invoiceItems: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({one}) => ({
        invoice: one(invoices, {
                fields: [invoiceItems.invoiceId],
                references: [invoices.id]
        }),
        product: one(products, {
                fields: [invoiceItems.productId],
                references: [products.id]
        }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({one, many}) => ({
        account: one(accounts, {
                fields: [purchaseOrders.supplierId],
                references: [accounts.id]
        }),
        user_createdBy: one(users, {
                fields: [purchaseOrders.createdBy],
                references: [users.id],
                relationName: "purchaseOrders_createdBy_users_id"
        }),
        user_approvedBy: one(users, {
                fields: [purchaseOrders.approvedBy],
                references: [users.id],
                relationName: "purchaseOrders_approvedBy_users_id"
        }),
        purchaseOrderItems: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({one}) => ({
        purchaseOrder: one(purchaseOrders, {
                fields: [purchaseOrderItems.purchaseOrderId],
                references: [purchaseOrders.id]
        }),
        product: one(products, {
                fields: [purchaseOrderItems.productId],
                references: [products.id]
        }),
}));

export const proposalTemplatesRelations = relations(proposalTemplates, ({one, many}) => ({
        user: one(users, {
                fields: [proposalTemplates.createdBy],
                references: [users.id]
        }),
        proposals: many(proposals),
}));

export const proposalElementsRelations = relations(proposalElements, ({one}) => ({
        user: one(users, {
                fields: [proposalElements.createdBy],
                references: [users.id]
        }),
        proposal: one(proposals, {
                fields: [proposalElements.proposalId],
                references: [proposals.id]
        }),
}));

export const proposalsRelations = relations(proposals, ({one, many}) => ({
        proposalElements: many(proposalElements),
        opportunity: one(opportunities, {
                fields: [proposals.opportunityId],
                references: [opportunities.id]
        }),
        account: one(accounts, {
                fields: [proposals.accountId],
                references: [accounts.id]
        }),
        proposalTemplate: one(proposalTemplates, {
                fields: [proposals.templateId],
                references: [proposalTemplates.id]
        }),
        user: one(users, {
                fields: [proposals.createdBy],
                references: [users.id]
        }),
        proposal: one(proposals, {
                fields: [proposals.previousVersionId],
                references: [proposals.id],
                relationName: "proposals_previousVersionId_proposals_id"
        }),
        proposals: many(proposals, {
                relationName: "proposals_previousVersionId_proposals_id"
        }),
        proposalCollaborators: many(proposalCollaborators),
        proposalComments: many(proposalComments),
        proposalActivities: many(proposalActivities),
}));

export const proposalCollaboratorsRelations = relations(proposalCollaborators, ({one}) => ({
        proposal: one(proposals, {
                fields: [proposalCollaborators.proposalId],
                references: [proposals.id]
        }),
        user_userId: one(users, {
                fields: [proposalCollaborators.userId],
                references: [users.id],
                relationName: "proposalCollaborators_userId_users_id"
        }),
        user_addedBy: one(users, {
                fields: [proposalCollaborators.addedBy],
                references: [users.id],
                relationName: "proposalCollaborators_addedBy_users_id"
        }),
}));

export const proposalCommentsRelations = relations(proposalComments, ({one, many}) => ({
        proposal: one(proposals, {
                fields: [proposalComments.proposalId],
                references: [proposals.id]
        }),
        user_userId: one(users, {
                fields: [proposalComments.userId],
                references: [users.id],
                relationName: "proposalComments_userId_users_id"
        }),
        proposalComment: one(proposalComments, {
                fields: [proposalComments.parentId],
                references: [proposalComments.id],
                relationName: "proposalComments_parentId_proposalComments_id"
        }),
        proposalComments: many(proposalComments, {
                relationName: "proposalComments_parentId_proposalComments_id"
        }),
        user_resolvedBy: one(users, {
                fields: [proposalComments.resolvedBy],
                references: [users.id],
                relationName: "proposalComments_resolvedBy_users_id"
        }),
}));

export const proposalActivitiesRelations = relations(proposalActivities, ({one}) => ({
        proposal: one(proposals, {
                fields: [proposalActivities.proposalId],
                references: [proposals.id]
        }),
        user: one(users, {
                fields: [proposalActivities.userId],
                references: [users.id]
        }),
}));