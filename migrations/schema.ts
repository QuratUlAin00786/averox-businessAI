import { pgTable, index, varchar, json, timestamp, unique, serial, text, boolean, integer, foreignKey, numeric, jsonb, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const apiProvider = pgEnum("api_provider", ['OpenAI', 'Stripe', 'Facebook', 'LinkedIn', 'Twitter', 'WhatsApp', 'Other'])
export const communicationChannel = pgEnum("communication_channel", ['Email', 'WhatsApp', 'SMS', 'Phone', 'Messenger', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Other'])
export const communicationDirection = pgEnum("communication_direction", ['Inbound', 'Outbound'])
export const communicationStatus = pgEnum("communication_status", ['Unread', 'Read', 'Replied', 'Archived'])
export const eventType = pgEnum("event_type", ['Meeting', 'Call', 'Demonstration', 'Follow-up', 'Other'])
export const inventoryTransactionType = pgEnum("inventory_transaction_type", ['Purchase', 'Sale', 'Adjustment', 'Return', 'Transfer'])
export const invoiceStatus = pgEnum("invoice_status", ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Refunded'])
export const leadStatus = pgEnum("lead_status", ['New', 'Qualified', 'Contacted', 'Not Interested', 'Converted'])
export const messageStatus = pgEnum("message_status", ['Unread', 'Read', 'Replied', 'Archived'])
export const opportunityStage = pgEnum("opportunity_stage", ['Lead Generation', 'Qualification', 'Proposal', 'Negotiation', 'Closing'])
export const paymentMethod = pgEnum("payment_method", ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'PayPal', 'Other'])
export const permissionAction = pgEnum("permission_action", ['view', 'create', 'update', 'delete', 'export', 'import', 'assign'])
export const proposalElementType = pgEnum("proposal_element_type", ['Header', 'Text', 'Image', 'Table', 'List', 'Quote', 'ProductList', 'Signature', 'PageBreak', 'Custom'])
export const proposalStatus = pgEnum("proposal_status", ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Revoked'])
export const purchaseOrderStatus = pgEnum("purchase_order_status", ['Draft', 'Sent', 'Received', 'Cancelled', 'Partially Received'])
export const socialPlatform = pgEnum("social_platform", ['Facebook', 'LinkedIn', 'Twitter', 'Instagram', 'WhatsApp', 'Email', 'Messenger', 'Other'])
export const subscriptionStatus = pgEnum("subscription_status", ['Active', 'Pending', 'Expired', 'Canceled', 'Trial'])
export const taskPriority = pgEnum("task_priority", ['High', 'Medium', 'Normal'])
export const taskStatus = pgEnum("task_status", ['Not Started', 'In Progress', 'Completed', 'Deferred'])
export const userRole = pgEnum("user_role", ['Admin', 'Manager', 'User', 'ReadOnly'])


export const session = pgTable("session", {
        sid: varchar().primaryKey().notNull(),
        sess: json().notNull(),
        expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
        index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const users = pgTable("users", {
        id: serial().primaryKey().notNull(),
        username: text().notNull(),
        password: text().notNull(),
        firstName: text("first_name"),
        lastName: text("last_name"),
        email: text().notNull(),
        role: text().default('User'),
        avatar: text(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        stripeCustomerId: text("stripe_customer_id"),
        stripeSubscriptionId: text("stripe_subscription_id"),
        isActive: boolean("is_active").default(true),
        lastLogin: timestamp("last_login", { mode: 'string' }),
        isVerified: boolean("is_verified").default(false),
        company: text(),
        packageId: integer("package_id"),
}, (table) => [
        unique("users_username_key").on(table.username),
        unique("users_email_key").on(table.email),
        unique("users_stripe_customer_id_key").on(table.stripeCustomerId),
        unique("users_stripe_subscription_id_key").on(table.stripeSubscriptionId),
]);

export const activities = pgTable("activities", {
        id: serial().primaryKey().notNull(),
        userId: integer("user_id"),
        action: text().notNull(),
        detail: text(),
        relatedToType: text("related_to_type"),
        relatedToId: integer("related_to_id"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        icon: text().default('added'),
}, (table) => [
        foreignKey({
                        columns: [table.userId],
                        foreignColumns: [users.id],
                        name: "activities_user_id_fkey"
                }),
]);

export const userSubscriptions = pgTable("user_subscriptions", {
        id: serial().primaryKey().notNull(),
        userId: integer("user_id").notNull(),
        packageId: integer("package_id").notNull(),
        status: subscriptionStatus().default('Pending'),
        startDate: timestamp("start_date", { mode: 'string' }).notNull(),
        endDate: timestamp("end_date", { mode: 'string' }),
        stripeSubscriptionId: text("stripe_subscription_id"),
        canceledAt: timestamp("canceled_at", { mode: 'string' }),
        currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
        currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        trialEndsAt: timestamp("trial_ends_at", { mode: 'string' }),
}, (table) => [
        foreignKey({
                        columns: [table.userId],
                        foreignColumns: [users.id],
                        name: "user_subscriptions_user_id_fkey"
                }),
        foreignKey({
                        columns: [table.packageId],
                        foreignColumns: [subscriptionPackages.id],
                        name: "user_subscriptions_package_id_fkey"
                }),
]);

export const subscriptionPackages = pgTable("subscription_packages", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        description: text().notNull(),
        price: numeric().notNull(),
        interval: text().notNull(),
        stripePriceId: text("stripe_price_id"),
        features: text().array(),
        maxUsers: integer("max_users").notNull(),
        maxContacts: integer("max_contacts").notNull(),
        maxStorage: integer("max_storage").notNull(),
        isActive: boolean("is_active").default(true),
        displayOrder: integer("display_order").default(0),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const socialIntegrations = pgTable("social_integrations", {
        id: serial().primaryKey().notNull(),
        userId: integer("user_id").notNull(),
        platform: socialPlatform().notNull(),
        accountId: text("account_id").notNull(),
        name: text().notNull(),
        accessToken: text("access_token").notNull(),
        refreshToken: text("refresh_token"),
        tokenExpiry: timestamp("token_expiry", { mode: 'string' }),
        settings: jsonb(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        isActive: boolean("is_active").default(true),
}, (table) => [
        foreignKey({
                        columns: [table.userId],
                        foreignColumns: [users.id],
                        name: "social_integrations_user_id_fkey"
                }),
]);

export const socialCampaigns = pgTable("social_campaigns", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        description: text(),
        content: text(),
        platform: socialPlatform(),
        integrationId: integer("integration_id"),
        status: text().default('Draft'),
        startDate: timestamp("start_date", { mode: 'string' }),
        endDate: timestamp("end_date", { mode: 'string' }),
        ownerId: integer("owner_id"),
        metrics: jsonb(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        isActive: boolean("is_active").default(true),
}, (table) => [
        foreignKey({
                        columns: [table.integrationId],
                        foreignColumns: [socialIntegrations.id],
                        name: "social_campaigns_integration_id_fkey"
                }),
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "social_campaigns_owner_id_fkey"
                }),
]);

export const leadSources = pgTable("lead_sources", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        description: text(),
        platform: socialPlatform(),
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const socialMessages = pgTable("social_messages", {
        id: serial().primaryKey().notNull(),
        integrationId: integer("integration_id").notNull(),
        externalId: text("external_id").notNull(),
        sender: text().notNull(),
        recipient: text(),
        message: text().notNull(),
        attachments: jsonb(),
        metadata: jsonb(),
        status: messageStatus().default('Unread'),
        leadId: integer("lead_id"),
        contactId: integer("contact_id"),
        receivedAt: timestamp("received_at", { mode: 'string' }),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        isDeleted: boolean("is_deleted").default(false),
        relatedToType: text("related_to_type"),
        relatedToId: integer("related_to_id"),
}, (table) => [
        foreignKey({
                        columns: [table.integrationId],
                        foreignColumns: [socialIntegrations.id],
                        name: "social_messages_integration_id_fkey"
                }),
        foreignKey({
                        columns: [table.leadId],
                        foreignColumns: [leads.id],
                        name: "social_messages_lead_id_fkey"
                }),
        foreignKey({
                        columns: [table.contactId],
                        foreignColumns: [contacts.id],
                        name: "social_messages_contact_id_fkey"
                }),
]);

export const events = pgTable("events", {
        id: serial().primaryKey().notNull(),
        title: text().notNull(),
        description: text(),
        startDate: timestamp("start_date", { mode: 'string' }).notNull(),
        endDate: timestamp("end_date", { mode: 'string' }).notNull(),
        location: text(),
        locationType: text("location_type").default('physical'),
        eventType: eventType("event_type").default('Meeting'),
        status: text().default('Confirmed'),
        ownerId: integer("owner_id"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        isAllDay: boolean("is_all_day").default(false),
        isRecurring: boolean("is_recurring").default(false),
        recurringRule: text("recurring_rule"),
}, (table) => [
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "events_owner_id_fkey"
                }),
]);

export const tasks = pgTable("tasks", {
        id: serial().primaryKey().notNull(),
        title: text().notNull(),
        description: text(),
        dueDate: date("due_date"),
        priority: taskPriority().default('Normal'),
        status: taskStatus().default('Not Started'),
        ownerId: integer("owner_id"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        relatedToType: text("related_to_type"),
        relatedToId: integer("related_to_id"),
        isReminder: boolean("is_reminder").default(false),
        reminderDate: timestamp("reminder_date", { mode: 'string' }),
}, (table) => [
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "tasks_owner_id_fkey"
                }),
]);

export const opportunities = pgTable("opportunities", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        accountId: integer("account_id"),
        stage: opportunityStage().default('Lead Generation'),
        amount: numeric(),
        expectedCloseDate: date("expected_close_date"),
        probability: integer(),
        ownerId: integer("owner_id"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        notes: text(),
        isClosed: boolean("is_closed").default(false),
        isWon: boolean("is_won").default(false),
}, (table) => [
        foreignKey({
                        columns: [table.accountId],
                        foreignColumns: [accounts.id],
                        name: "opportunities_account_id_fkey"
                }),
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "opportunities_owner_id_fkey"
                }),
]);

export const leads = pgTable("leads", {
        id: serial().primaryKey().notNull(),
        firstName: text("first_name").notNull(),
        lastName: text("last_name").notNull(),
        email: text(),
        phone: text(),
        company: text(),
        title: text(),
        status: leadStatus().default('New'),
        source: text(),
        ownerId: integer("owner_id"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        notes: text(),
        isConverted: boolean("is_converted").default(false),
        convertedToContactId: integer("converted_to_contact_id"),
        convertedToAccountId: integer("converted_to_account_id"),
        convertedToOpportunityId: integer("converted_to_opportunity_id"),
}, (table) => [
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "leads_owner_id_fkey"
                }),
        foreignKey({
                        columns: [table.convertedToContactId],
                        foreignColumns: [contacts.id],
                        name: "leads_converted_to_contact_id_fkey"
                }),
        foreignKey({
                        columns: [table.convertedToAccountId],
                        foreignColumns: [accounts.id],
                        name: "leads_converted_to_account_id_fkey"
                }),
        foreignKey({
                        columns: [table.convertedToOpportunityId],
                        foreignColumns: [opportunities.id],
                        name: "leads_converted_to_opportunity_id_fkey"
                }),
]);

export const contacts = pgTable("contacts", {
        id: serial().primaryKey().notNull(),
        firstName: text("first_name").notNull(),
        lastName: text("last_name").notNull(),
        email: text(),
        phone: text(),
        title: text(),
        accountId: integer("account_id"),
        ownerId: integer("owner_id"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        address: text(),
        city: text(),
        state: text(),
        zip: text(),
        country: text(),
        notes: text(),
        isActive: boolean("is_active").default(true),
}, (table) => [
        foreignKey({
                        columns: [table.accountId],
                        foreignColumns: [accounts.id],
                        name: "contacts_account_id_fkey"
                }),
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "contacts_owner_id_fkey"
                }),
]);

export const workflows = pgTable("workflows", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        isActive: boolean("is_active").default(true),
        description: text(),
        settings: jsonb(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        entityType: text("entity_type").notNull(),
        entityFilter: jsonb("entity_filter"),
        actions: jsonb().notNull(),
        createdBy: integer("created_by"),
        updatedBy: integer("updated_by"),
        version: integer(),
});

export const productCategoriesTable = pgTable("product_categories", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        description: text(),
        parentId: integer("parent_id"),
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        image: text(),
        attributes: jsonb(),
        ownerId: integer("owner_id"),
}, (table) => [
        foreignKey({
                        columns: [table.parentId],
                        foreignColumns: [table.id],
                        name: "product_categories_parent_id_fkey"
                }),
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "product_categories_owner_id_fkey"
                }),
        unique("product_categories_name_key").on(table.name),
]);

export const products = pgTable("products", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        sku: text().notNull(),
        description: text(),
        price: numeric().notNull(),
        cost: numeric(),
        categoryId: integer("category_id"),
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        inStock: boolean("in_stock").default(true),
        stockQuantity: integer("stock_quantity").default(0),
        reorderLevel: integer("reorder_level").default(5),
        attributes: jsonb(),
        images: text().array(),
        taxable: boolean().default(true),
        taxRate: numeric("tax_rate"),
        ownerId: integer("owner_id"),
        weight: numeric(),
        dimensions: jsonb(),
        barcode: text(),
        tags: text().array(),
}, (table) => [
        foreignKey({
                        columns: [table.categoryId],
                        foreignColumns: [productCategoriesTable.id],
                        name: "products_category_id_fkey"
                }),
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "products_owner_id_fkey"
                }),
        unique("products_sku_key").on(table.sku),
]);

export const inventoryTransactions = pgTable("inventory_transactions", {
        id: serial().primaryKey().notNull(),
        productId: integer("product_id").notNull(),
        quantity: integer().notNull(),
        type: inventoryTransactionType().notNull(),
        referenceType: text("reference_type"),
        referenceId: integer("reference_id"),
        notes: text(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        createdBy: integer("created_by"),
        unitCost: numeric("unit_cost"),
        location: text(),
        batchId: text("batch_id"),
        expiryDate: date("expiry_date"),
        serialNumber: text("serial_number"),
}, (table) => [
        foreignKey({
                        columns: [table.productId],
                        foreignColumns: [products.id],
                        name: "inventory_transactions_product_id_fkey"
                }),
        foreignKey({
                        columns: [table.createdBy],
                        foreignColumns: [users.id],
                        name: "inventory_transactions_created_by_fkey"
                }),
]);

export const modulePermissions = pgTable("module_permissions", {
        id: serial().primaryKey().notNull(),
        moduleName: text("module_name").notNull(),
        displayName: text("display_name").notNull(),
        description: text(),
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        order: integer().default(0),
        icon: text(),
});

export const rolePermissions = pgTable("role_permissions", {
        id: serial().primaryKey().notNull(),
        role: userRole().notNull(),
        moduleId: integer("module_id").notNull(),
        action: text().notNull(),
        isAllowed: boolean("is_allowed").default(false),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const userPermissions = pgTable("user_permissions", {
        id: serial().primaryKey().notNull(),
        userId: integer("user_id").notNull(),
        moduleId: integer("module_id").notNull(),
        action: text().notNull(),
        isAllowed: boolean("is_allowed").default(false),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const teams = pgTable("teams", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        description: text(),
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        createdBy: integer("created_by"),
        parentTeamId: integer("parent_team_id"),
});

export const assignments = pgTable("assignments", {
        id: serial().primaryKey().notNull(),
        entityType: text("entity_type").notNull(),
        entityId: integer("entity_id").notNull(),
        assignedToType: text("assigned_to_type").notNull(),
        assignedToId: integer("assigned_to_id").notNull(),
        assignedById: integer("assigned_by_id"),
        assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
        notes: text(),
});

export const teamMembers = pgTable("team_members", {
        id: serial().primaryKey().notNull(),
        teamId: integer("team_id").notNull(),
        userId: integer("user_id").notNull(),
        role: text(),
        isLeader: boolean("is_leader").default(false),
        joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const invoices = pgTable("invoices", {
        id: serial().primaryKey().notNull(),
        invoiceNumber: text("invoice_number").notNull(),
        accountId: integer("account_id").notNull(),
        contactId: integer("contact_id"),
        issueDate: date("issue_date").notNull(),
        dueDate: date("due_date").notNull(),
        status: invoiceStatus().default('Draft'),
        subtotal: numeric().notNull(),
        taxAmount: numeric("tax_amount").notNull(),
        discountAmount: numeric("discount_amount").default('0'),
        totalAmount: numeric("total_amount").notNull(),
        notes: text(),
        terms: text(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        ownerId: integer("owner_id"),
        paymentMethod: paymentMethod("payment_method"),
        paymentDate: date("payment_date"),
        paymentReference: text("payment_reference"),
        currency: text().default('USD'),
}, (table) => [
        foreignKey({
                        columns: [table.accountId],
                        foreignColumns: [accounts.id],
                        name: "invoices_account_id_fkey"
                }),
        foreignKey({
                        columns: [table.contactId],
                        foreignColumns: [contacts.id],
                        name: "invoices_contact_id_fkey"
                }),
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "invoices_owner_id_fkey"
                }),
        unique("invoices_invoice_number_key").on(table.invoiceNumber),
]);

export const invoiceItems = pgTable("invoice_items", {
        id: serial().primaryKey().notNull(),
        invoiceId: integer("invoice_id").notNull(),
        productId: integer("product_id"),
        description: text().notNull(),
        quantity: numeric().notNull(),
        unitPrice: numeric("unit_price").notNull(),
        taxRate: numeric("tax_rate"),
        taxAmount: numeric("tax_amount"),
        discountPercent: numeric("discount_percent"),
        discountAmount: numeric("discount_amount"),
        lineTotal: numeric("line_total").notNull(),
        sortOrder: integer("sort_order").default(0),
}, (table) => [
        foreignKey({
                        columns: [table.invoiceId],
                        foreignColumns: [invoices.id],
                        name: "invoice_items_invoice_id_fkey"
                }),
        foreignKey({
                        columns: [table.productId],
                        foreignColumns: [products.id],
                        name: "invoice_items_product_id_fkey"
                }),
]);

export const purchaseOrders = pgTable("purchase_orders", {
        id: serial().primaryKey().notNull(),
        poNumber: text("po_number").notNull(),
        supplierId: integer("supplier_id").notNull(),
        status: purchaseOrderStatus().default('Draft'),
        orderDate: date("order_date").notNull(),
        expectedDeliveryDate: date("expected_delivery_date"),
        deliveryDate: date("delivery_date"),
        subtotal: numeric().notNull(),
        taxAmount: numeric("tax_amount"),
        totalAmount: numeric("total_amount").notNull(),
        notes: text(),
        shippingAddress: text("shipping_address"),
        billingAddress: text("billing_address"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        createdBy: integer("created_by"),
        approvedBy: integer("approved_by"),
        approvalDate: date("approval_date"),
        currency: text().default('USD'),
}, (table) => [
        foreignKey({
                        columns: [table.supplierId],
                        foreignColumns: [accounts.id],
                        name: "purchase_orders_supplier_id_fkey"
                }),
        foreignKey({
                        columns: [table.createdBy],
                        foreignColumns: [users.id],
                        name: "purchase_orders_created_by_fkey"
                }),
        foreignKey({
                        columns: [table.approvedBy],
                        foreignColumns: [users.id],
                        name: "purchase_orders_approved_by_fkey"
                }),
        unique("purchase_orders_po_number_key").on(table.poNumber),
]);

export const purchaseOrderItems = pgTable("purchase_order_items", {
        id: serial().primaryKey().notNull(),
        purchaseOrderId: integer("purchase_order_id").notNull(),
        productId: integer("product_id"),
        description: text().notNull(),
        quantity: numeric().notNull(),
        receivedQuantity: numeric("received_quantity").default('0'),
        unitPrice: numeric("unit_price").notNull(),
        taxAmount: numeric("tax_amount"),
        lineTotal: numeric("line_total").notNull(),
        expectedDeliveryDate: date("expected_delivery_date"),
        notes: text(),
        sortOrder: integer("sort_order").default(0),
}, (table) => [
        foreignKey({
                        columns: [table.purchaseOrderId],
                        foreignColumns: [purchaseOrders.id],
                        name: "purchase_order_items_purchase_order_id_fkey"
                }),
        foreignKey({
                        columns: [table.productId],
                        foreignColumns: [products.id],
                        name: "purchase_order_items_product_id_fkey"
                }),
]);

export const communications = pgTable("communications", {
        id: serial().primaryKey().notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        channel: communicationChannel().notNull(),
        direction: communicationDirection().notNull(),
        contactId: integer("contact_id"),
        leadId: integer("lead_id"),
        content: text().notNull(),
        status: communicationStatus().default('Unread'),
        sentAt: timestamp("sent_at", { mode: 'string' }),
        receivedAt: timestamp("received_at", { mode: 'string' }),
        ownerId: integer("owner_id"),
        subject: text(),
        attachments: jsonb(),
        isStarred: boolean("is_starred").default(false),
        labels: jsonb(),
        metadata: jsonb(),
        contactType: text("contact_type"),
        contactDetails: jsonb("contact_details"),
});

export const proposalTemplates = pgTable("proposal_templates", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        description: text(),
        content: jsonb().notNull(),
        thumbnail: text(),
        isDefault: boolean("is_default").default(false),
        createdBy: integer("created_by"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        isActive: boolean("is_active").default(true),
        category: text(),
        tags: text().array(),
}, (table) => [
        foreignKey({
                        columns: [table.createdBy],
                        foreignColumns: [users.id],
                        name: "proposal_templates_created_by_fkey"
                }),
]);

export const proposalElements = pgTable("proposal_elements", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        elementType: proposalElementType("element_type").notNull(),
        content: jsonb().notNull(),
        createdBy: integer("created_by"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        isGlobal: boolean("is_global").default(false),
        isActive: boolean("is_active").default(true),
        category: text().default('General'),
        thumbnail: text(),
        proposalId: integer("proposal_id"),
        sortOrder: integer("sort_order"),
}, (table) => [
        foreignKey({
                        columns: [table.createdBy],
                        foreignColumns: [users.id],
                        name: "proposal_elements_created_by_fkey"
                }),
        foreignKey({
                        columns: [table.proposalId],
                        foreignColumns: [proposals.id],
                        name: "proposal_elements_proposal_id_fkey"
                }),
]);

export const proposals = pgTable("proposals", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        opportunityId: integer("opportunity_id").notNull(),
        accountId: integer("account_id").notNull(),
        status: proposalStatus().default('Draft'),
        content: jsonb().notNull(),
        templateId: integer("template_id"),
        createdBy: integer("created_by").notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        sentAt: timestamp("sent_at", { mode: 'string' }),
        expiresAt: timestamp("expires_at", { mode: 'string' }),
        acceptedAt: timestamp("accepted_at", { mode: 'string' }),
        rejectedAt: timestamp("rejected_at", { mode: 'string' }),
        totalAmount: numeric("total_amount"),
        currency: text().default('USD'),
        versionNumber: integer("version_number").default(1),
        previousVersionId: integer("previous_version_id"),
        settings: jsonb(),
        metadata: jsonb(),
}, (table) => [
        foreignKey({
                        columns: [table.opportunityId],
                        foreignColumns: [opportunities.id],
                        name: "proposals_opportunity_id_fkey"
                }),
        foreignKey({
                        columns: [table.accountId],
                        foreignColumns: [accounts.id],
                        name: "proposals_account_id_fkey"
                }),
        foreignKey({
                        columns: [table.templateId],
                        foreignColumns: [proposalTemplates.id],
                        name: "proposals_template_id_fkey"
                }),
        foreignKey({
                        columns: [table.createdBy],
                        foreignColumns: [users.id],
                        name: "proposals_created_by_fkey"
                }),
        foreignKey({
                        columns: [table.previousVersionId],
                        foreignColumns: [table.id],
                        name: "proposals_previous_version_id_fkey"
                }),
]);

export const proposalCollaborators = pgTable("proposal_collaborators", {
        id: serial().primaryKey().notNull(),
        proposalId: integer("proposal_id").notNull(),
        userId: integer("user_id").notNull(),
        role: text().default('Editor'),
        addedBy: integer("added_by"),
        addedAt: timestamp("added_at", { mode: 'string' }).defaultNow(),
        lastAccessed: timestamp("last_accessed", { mode: 'string' }),
        notifications: boolean().default(true),
}, (table) => [
        foreignKey({
                        columns: [table.proposalId],
                        foreignColumns: [proposals.id],
                        name: "proposal_collaborators_proposal_id_fkey"
                }),
        foreignKey({
                        columns: [table.userId],
                        foreignColumns: [users.id],
                        name: "proposal_collaborators_user_id_fkey"
                }),
        foreignKey({
                        columns: [table.addedBy],
                        foreignColumns: [users.id],
                        name: "proposal_collaborators_added_by_fkey"
                }),
]);

export const apiKeys = pgTable("api_keys", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        provider: text().notNull(),
        key: text().notNull(),
        secret: text(),
        projectId: text("project_id"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        expiresAt: timestamp("expires_at", { mode: 'string' }),
        userId: integer("user_id").notNull(),
        usageData: jsonb("usage_data"),
        rateLimit: integer("rate_limit"),
        isActive: boolean("is_active").default(true),
        additionalFields: jsonb("additional_fields"),
});

export const proposalComments = pgTable("proposal_comments", {
        id: serial().primaryKey().notNull(),
        proposalId: integer("proposal_id").notNull(),
        userId: integer("user_id").notNull(),
        content: text().notNull(),
        elementPath: text("element_path"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }),
        parentId: integer("parent_id"),
        resolved: boolean().default(false),
        resolvedBy: integer("resolved_by"),
        resolvedAt: timestamp("resolved_at", { mode: 'string' }),
}, (table) => [
        foreignKey({
                        columns: [table.proposalId],
                        foreignColumns: [proposals.id],
                        name: "proposal_comments_proposal_id_fkey"
                }),
        foreignKey({
                        columns: [table.userId],
                        foreignColumns: [users.id],
                        name: "proposal_comments_user_id_fkey"
                }),
        foreignKey({
                        columns: [table.parentId],
                        foreignColumns: [table.id],
                        name: "proposal_comments_parent_id_fkey"
                }),
        foreignKey({
                        columns: [table.resolvedBy],
                        foreignColumns: [users.id],
                        name: "proposal_comments_resolved_by_fkey"
                }),
]);

export const proposalActivities = pgTable("proposal_activities", {
        id: serial().primaryKey().notNull(),
        proposalId: integer("proposal_id").notNull(),
        userId: integer("user_id"),
        activityType: text("activity_type").notNull(),
        description: text(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        metadata: jsonb(),
}, (table) => [
        foreignKey({
                        columns: [table.proposalId],
                        foreignColumns: [proposals.id],
                        name: "proposal_activities_proposal_id_fkey"
                }),
        foreignKey({
                        columns: [table.userId],
                        foreignColumns: [users.id],
                        name: "proposal_activities_user_id_fkey"
                }),
]);

export const accounts = pgTable("accounts", {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        industry: text(),
        website: text(),
        phone: text(),
        billingAddress: text("billing_address"),
        billingCity: text("billing_city"),
        billingState: text("billing_state"),
        billingZip: text("billing_zip"),
        billingCountry: text("billing_country"),
        ownerId: integer("owner_id"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        annualRevenue: numeric("annual_revenue"),
        employeeCount: integer("employee_count"),
        notes: text(),
        isActive: boolean("is_active").default(true),
        email: text(),
        type: text(),
        numberOfEmployees: integer("number_of_employees"),
        address: text(),
        city: text(),
        state: text(),
        zip: text(),
        country: text(),
}, (table) => [
        foreignKey({
                        columns: [table.ownerId],
                        foreignColumns: [users.id],
                        name: "accounts_owner_id_fkey"
                }),
]);
