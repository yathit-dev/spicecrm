/* 
 * Copyright notice
 * 
 * (c) 2015 twentyreasons business solutions GmbH <office@twentyreasons.com>
 * 
 * All rights reserved
 */

/*global Ext,CES,window,alert */

Ext.define('CES.model.User', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'}
    ]
});

Ext.define('CES.model.Sync', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'syncType', type: 'string'},
        {name: 'server', type: 'string'},
        {name: 'upn', type: 'string'},
        {name: 'userId', type: 'string'},
        {name: 'exchangeSyncState', type: 'string'},
        {name: 'initialSyncFromExchangeCompleted', type: 'boolean'},
        {name: 'initialSyncToExchangeCompleted', type: 'boolean'},
        {name: 'sugarLastSyncDate', type: 'string'},
        {name: 'startAfter', type: 'string'},
        {name: 'nextOffset', type: 'int'},
        {name: 'deleted', type: 'boolean'},
    ]
});

Ext.define('CES.model.Server', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'url', type: 'string'}
    ]
});


Ext.define('CES.store.AddUsers', {
    extend: 'Ext.data.Store',
    model: 'CES.model.User',
    proxy: {
        type: 'ajax',
        url: 'index.php?json=1&module=TRExchangeConnector&action=getaddusers'
    },
    autoLoad: false,
    sorters: 'name'
});

Ext.define('CES.store.SyncUsers', {
    extend: 'Ext.data.Store',
    model: 'CES.model.User',
    proxy: {
        type: 'ajax',
        url: 'index.php?json=1&module=TRExchangeConnector&action=getsyncusers'
    },
    autoLoad: true,
    sorters: 'name'
});

Ext.define('CES.store.Syncs', {
    extend: 'Ext.data.Store',
    model: 'CES.model.Sync',
    proxy: {
        type: 'ajax',
        url: 'index.php?json=1&module=TRExchangeConnector&action=getsynclist',
        api: {
            update: 'index.php?json=1&module=TRExchangeConnector&action=updatesync',
        },
        writer: {
            type: 'json',
            writeAllFields: false
        },
        batchActions: false
    },
    autoLoad: true,
    sorters: 'syncType'
});

Ext.define('CES.store.Servers', {
    extend: 'Ext.data.Store',
    model: 'CES.model.Server',
    proxy: {
        type: 'ajax',
        url: 'index.php?json=1&module=TRExchangeConnector&action=getservers',
    },
    autoLoad: true
});

Ext.define('CES.view.dialog.EditSync', {
    extend: 'Ext.window.Window',
    modal: true,
    height: '400px',
    width: '300px',
    title: 'Edit Sync',
    layout: 'form',
    bodyPadding: 5,
    autoScroll: true,
    config: {
        sync: null
    },
    initComponent: function () {
        this.items = this.getItemList();
        this.buttons = this.getButtons();
        this.callParent(arguments);
    },
    getItemList: function () {
        var sugarDateFormat = cal_date_format.replace(/\%/g, '') + ' H' + time_separator + 'i';        
        var fixedItems = [
            {
                xtype: 'displayfield',
                fieldLabel: 'Sync Type',
                value: this.sync.get('syncType')
            },
            {
                xtype: 'combobox',
                fieldLabel: 'Server',
                queryMode: 'local',
                store: 'Servers',
                displayField: 'url',
                valueField: 'url',
                editable: false,
                autoSelect: true,
                itemId: 'server',
                value: this.sync.get('server')
            },
            {
                xtype: 'displayfield',
                fieldLabel: 'UPN',
                value: this.sync.get('upn')
            },
            {
                xtype: 'displayfield',
                fieldLabel: 'Sugar Id',
                value: this.sync.get('userId')
            },
            {
                xtype: 'displayfield',
                fieldLabel: 'Exchange Sync State',
                cls: 'text-wrapper',
                value: this.sync.get('exchangeSyncState')
            },
            {
                xtype: 'displayfield',
                fieldLabel: 'Sugar Last Sync Date',
                value: this.sync.get('sugarLastSyncDate')
            },
            {
                xtype: 'displayfield',
                fieldLabel: 'Next Offset',
                value: this.sync.get('nextOffset')
            }
        ];
        var syncDependendItems = [];
        if (this.sync.get('syncType') === 'CalendarItems') {
            syncDependendItems.push(
                    {
                        xtype: 'datefield',
                        fieldLabel: 'Startdate after',
                        value: Ext.Date.parse(this.sync.get('startAfter'), sugarDateFormat),
                        format: sugarDateFormat,
                        itemId: 'startafterdate'
                    });
        }
        return fixedItems.concat(syncDependendItems);
    },
    getButtons: function() {
//        var saveDisabled = this.sync.get('syncType') !== 'CalendarItems';
        var buttons = [
            {
                xtype: 'button',
                text: 'Save',
                itemId: 'savesync',
//                disabled: saveDisabled
            },
            {
                xtype: 'button',
                text: 'Cancel',
                handler: function (button, event) {
                    this.up('window').close();
                    Ext.EventManager.stopEvent(event);
                }
            }
        ];
        return buttons;
    }
});

Ext.define('CES.view.dialog.EncryptPassword', {
    extend: 'Ext.window.Window',
    modal: true,
    height: '200px',
    width: '400px',
    title: 'Encrypt Password',
    layout: 'form',
    bodyPadding: 5,
    items: [
        {
            xtype: 'textfield',
            fieldLabel: 'Password',
            itemId: 'unencryptedpw'
        },
        {
            xtype: 'displayfield',
            fieldLabel: 'Encrypted Password',
            itemId: 'encryptedpassword'
        }
    ],
    buttons: [
        {
            xtype: 'button',
            text: 'OK',
            itemId: 'encryptpasswordok'
        },
        {
            xtype: 'button',
            text: 'Cancel',
            handler: function (button, event) {
                this.up('window').close();
                Ext.EventManager.stopEvent(event);
            }
        }
    ]
});

Ext.define('CES.view.dialog.ResetSync', {
    extend: 'Ext.window.Window',
    modal: true,
    height: '200px',
    width: '400px',
    title: 'Reset Sync',
    layout: {
        type: 'vbox',
        pack: 'center',
        align: 'stretch'
    },
    bodyPadding: 5,
    items: [
        {
            xtype: 'container',
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'checkbox',
                    fieldLabel: 'Clear Logs ?',
                    itemId: 'resetsyncclearlogs'
                }
            ]
        }
    ],
    buttons: [
        {
            xtype: 'button',
            text: 'OK',
            itemId: 'resetsyncok'
        },
        {
            xtype: 'button',
            text: 'Cancel',
            handler: function (ignore, event) {
                this.up('window').close();
                Ext.EventManager.stopEvent(event);
            }
        }
    ]
});

Ext.define('CES.view.dialog.AddUser', {
    extend: 'Ext.window.Window',
    modal: true,
    height: '400px',
    width: '600px',
    title: 'Add Sync User',
    layout: 'form',
    bodyPadding: 5,
    items: [
        {
            xtype: 'grid',
            store: 'AddUsers',
            columns: [
                {
                    text: 'Name',
                    dataIndex: 'name',
                    flex: 1
                }
            ],
            tbar: [
                {
                    xtype: 'textfield',
                    itemId: 'addusersearchfield',
                    fieldLabel: 'Filter users'
                }
            ],
            itemId: 'newuser',
            height: 250
        },
        {
            xtype: 'box',
            height: 20
        },
        {
            xtype: 'textfield',
            fieldLabel: 'UPN (Exchange)',
            itemId: 'upn'
        },
        {
            xtype: 'combobox',
            fieldLabel: 'Server',
            queryMode: 'local',
            store: 'Servers',
            displayField: 'url',
            valueField: 'url',
            editable: false,
            autoSelect: true,
            allowBlank: false,
            itemId: 'server',
            listeners: {
                afterrender: function() {
                    if(this.store.count()>0) {
                        this.setValue(this.store.getAt(0).get(this.valueField));
                    }
                }                
            }
        }
    ],
    buttons: [
        {
            xtype: 'button',
            text: 'OK',
            itemId: 'adduserok'
        },
        {
            xtype: 'button',
            text: 'Cancel',
            handler: function (button, event) {
                this.up('window').close();
                Ext.EventManager.stopEvent(event);
            }
        }
    ]
});

Ext.define('CES.view.Main', {
    extend: 'Ext.panel.Panel',
    frame: true,
    id: 'exchangeconfig',
    renderTo: 'admincontent',
    title: 'Configure Exchangesync',
    height: '100%',
    border: false,
    tbar: [
        {
            xtype: 'button',
            text: 'Encrypt Password',
            itemId: 'encryptpassword'
        }
    ],
    items: [
        {
            xtype: 'grid',
            title: 'Sync Users',
            store: 'SyncUsers',
            columns: [
                {
                    text: 'User',
                    dataIndex: 'name',
                    flex: 1
                }
            ],
            tbar: [
                {
                    xtype: 'textfield',
                    itemId: 'usersearchfield',
                    fieldLabel: 'Filter Users'
                },
                '->',
                {
                    xtype: 'button',
                    text: 'Add user',
                    itemId: 'adduser'
                },
                {
                    xtype: 'button',
                    text: 'Remove user',
                    itemId: 'removeuser'
                }
            ],
            flex: 1,
            itemId: 'usergrid'
        },
        {
            xtype: 'grid',
            title: 'Configured Syncs',
            store: 'Syncs',
            columns: [
                {
                    text: 'Type',
                    dataIndex: 'syncType',
                    flex: 1
                },
                {
                    text: 'UPN',
                    dataIndex: 'upn',
                    flex: 1
                },
                {
                    xtype: 'booleancolumn',
                    text: 'Initial From Exchange Completed ?',
                    trueText: 'Yes',
                    falseText: 'No',
                    dataIndex: 'initialSyncFromExchangeCompleted',
                    flex: 1
                },
                {
                    xtype: 'booleancolumn',
                    text: 'Initial To Exchange Completed ?',
                    trueText: 'Yes',
                    falseText: 'No',
                    dataIndex: 'initialSyncToExchangeCompleted',
                    flex: 1
                },
                {
                    text: 'Sugar Last Sync Date',
                    dataIndex: 'sugarLastSyncDate',
                    flex: 1
                },
                {
                    xtype: 'booleancolumn',
                    text: 'Active ?',
                    trueText: 'No',
                    falseText: 'Yes',
                    dataIndex: 'deleted',
                    flex: 1
                },
            ],
            tbar: [
                {
                    xtype: 'button',
                    text: 'Disable Sync',
                    itemId: 'disablesync',
                    disabled: true
                },
                {
                    xtype: 'button',
                    text: 'Reset Sync',
                    itemId: 'resetsync',
                    disabled: true
                },
                {
                    xtype: 'button',
                    text: 'Test Connectivity',
                    itemId: 'testconnectivity',
                    disabled: true
                },
                '->',
                {
                    xtype: 'button',
                    text: 'Refresh Sync List',
                    itemId: 'refreshsynclist',
                    disabled: true                    
                }
            ],
            flex: 2,
            itemId: 'syncgrid'
        }
    ],
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    initComponent: function () {
        this.loadMask = new Ext.LoadMask(this, {msg: "Please wait..."});
        this.callParent(arguments);
    }
});


Ext.define('CES.controller.Main', {
    extend: 'Ext.app.Controller',
    stores: ['SyncUsers', 'Syncs', 'AddUsers', 'Servers'],
    refs: [
        {
            ref: 'MainView',
            selector: '#exchangeconfig'
        },
        {
            ref: 'UserGrid',
            selector: '#usergrid'
        },
        {
            ref: 'SyncGrid',
            selector: '#syncgrid'
        }
    ],
    syncActions: ['#testconnectivity', '#disablesync', '#resetsync'],
    init: function () {
        this.control({
            '#usergrid': {
                select: this.onUserSelect
            },
            '#usersearchfield': {
                change: this.onUserSearchFieldChange
            },
            '#syncgrid': {
                select: this.onSyncSelect,
                itemdblclick: this.onSyncDblClick
            },
            '#testconnectivity': {
                click: this.onTestConnectivity
            },
            '#disablesync': {
                click: this.onDisableSync
            },
            '#refreshsynclist': {
                click: this.onRefreshSyncList
            },
            '#resetsync': {
                click: this.onResetSync
            },
            '#resetsyncok': {
                click: this.onResetSyncOk
            },
            '#adduser': {
                click: this.onAddUser
            },
            '#adduserok': {
                click: this.onAddUserOk
            },
            '#addusersearchfield': {
                change: this.onAddUserSearchFieldChange
            },
            '#removeuser': {
                click: this.onRemoveUser
            },
            '#removeuserok': {
                click: this.onRemoveUserOk
            },
            '#encryptpassword': {
                click: this.onEncryptPassword
            },
            '#encryptpasswordok': {
                click: this.onEncryptPasswordOk
            },
            '#savesync': {
                click: this.onSaveSync
            }
        });
    },
    onUserSelect: function (grid, record) {
        var syncStore = this.getSyncsStore();
        syncStore.getProxy().extraParams = {
            userId: record.get('id')
        };
        syncStore.load();
        this.setDisabledSyncActions(true);
        this.getMainView().down('#refreshsynclist').setDisabled(false);
    },
    onSyncSelect: function (grid, record) {
        var syncButtonText;
        var deleted = record.get('deleted');
        if (deleted) {
            syncButtonText = 'Enable Sync';
        } else {
            syncButtonText = 'Disable Sync';
        }
        var syncButton = Ext.ComponentQuery.query('#disablesync')[0];
        syncButton.setText(syncButtonText);
        this.setDisabledSyncActions(false);
    },
    onSyncDblClick: function (grid, record, item) {
        this.editSyncDialog = new CES.view.dialog.EditSync({
            sync: record
        });
        this.editSyncDialog.show();
    },
    onUserSearchFieldChange: function (field, value) {
        this.getStore('SyncUsers').clearFilter();
        if ('' !== value) {
            this.getStore('SyncUsers').filter({
                property: 'name',
                value: value,
                anyMatch: true
            });
        }
    },
    onDisableSync: function (button, event) {
        var me = this;
        me.getMainView().loadMask.show();
        var selectedSync = me.getSyncGrid().getSelectionModel().getSelection()[0];
        Ext.Ajax.request({
            url: 'index.php?json=1&module=TRExchangeConnector&action=disablesync',
            params: {
                syncId: selectedSync.get('id')
            },
            success: function (response) {
                me.getMainView().loadMask.hide();
                me.getSyncsStore().load({
                    callback: function () {
                        var selectedIndex = me.getSyncsStore().find('id', selectedSync.get('id'));
                        me.getSyncGrid().getSelectionModel().select(selectedIndex);
                    }
                });
            },
            failure: function (response) {
                me.getMainView().loadMask.hide();
                alert("Request failed\n" + response.statusText);
            }
        });
    },
    onTestConnectivity: function (button, event) {
        var me = this;
        me.getMainView().loadMask.show();
        var selectedSync = me.getSyncGrid().getSelectionModel().getSelection()[0];
        Ext.Ajax.request({
            url: 'index.php?json=1&module=TRExchangeConnector&action=testsyncconnectivity',
            params: {
                syncId: selectedSync.get('id')
            },
            success: function (response) {
                me.getMainView().loadMask.hide();
                var result = Ext.decode(response.responseText);
                alert(result.message);
            },
            failure: function (response) {
                me.getMainView().loadMask.hide();
                alert("Request failed\n" + response.statusText);
            }
        });
    },
    onResetSync: function (button, event) {
        this.resetDialog = new CES.view.dialog.ResetSync();
        this.resetDialog.show();
    },
    onResetSyncOk: function (button, event) {
        Ext.EventManager.stopEvent(event);
        var me = this;
        var selectedSync = me.getSyncGrid().getSelectionModel().getSelection()[0];
        var clearLogsCheckbox = Ext.ComponentQuery.query('#resetsyncclearlogs')[0];
        Ext.Ajax.request({
            url: 'index.php?json=1&module=TRExchangeConnector&action=resetsync',
            params: {
                syncId: selectedSync.get('id'),
                clearLogs: clearLogsCheckbox.getValue()
            },
            success: function (response) {
                button.up('window').close();
                me.getSyncsStore().load({
                    callback: function () {
                        var selectedIndex = me.getSyncsStore().find('id', selectedSync.get('id'));
                        me.getSyncGrid().getSelectionModel().select(selectedIndex);
                    }
                });
            },
            failure: function (response) {
                alert("Request failed\n" + response.statusText);
                button.up('window').close();
            }
        });
    },
    onAddUser: function (button, event) {
        this.getAddUsersStore().clearFilter();
        this.getAddUsersStore().load();
        this.addUserDialog = new CES.view.dialog.AddUser();
        this.addUserDialog.show();
    },
    onAddUserOk: function (button, event) {
        var me = this, selectedUserId;
        var userSelection = this.addUserDialog.down('#newuser').getSelectionModel().getSelection();
        if (userSelection.length !== 0) {
            selectedUserId = userSelection[0].get('id');
        } else {
            alert('No user selected');
            return;
        }
        var upn = this.addUserDialog.down('#upn').getValue();
        var server = this.addUserDialog.down('#server').getValue();
        Ext.Ajax.request({
            url: 'index.php?json=1&module=TRExchangeConnector&action=createsyncs',
            params: {
                userId: selectedUserId,
                upn: upn,
                server: server
            },
            success: function (response) {
                button.up('window').close();
                me.getSyncUsersStore().load({
                    callback: function () {
                        var selectedIndex = me.getSyncUsersStore().find('id', selectedUserId);
                        me.getUserGrid().getSelectionModel().select(selectedIndex);
                    }
                });
            },
            failure: function (response) {
                alert("Request failed\n" + response.statusText);
                button.up('window').close();
            }
        });
    },
    onAddUserSearchFieldChange: function (field, value) {
        this.getStore('AddUsers').clearFilter();
        if ('' !== value) {
            this.getStore('AddUsers').filter({
                property: 'name',
                value: value,
                anyMatch: true
            });
        }
    },
    onRemoveUser: function (button, event) {
        var me = this;
        var selectedUsers = this.getUserGrid().getSelectionModel().getSelection();
        if (selectedUsers.length === 0) {
            alert('No user selected');
            return;
        }
        var selectedUser = selectedUsers[0];
        Ext.MessageBox.confirm({
            title: 'Remove User',
            msg: 'Do you really want to permanently delete the sync data of ' + selectedUser.get('name') + ' ?',
            fn: function (buttonId) {
                if (buttonId === 'ok') {
                    Ext.Ajax.request({
                        url: 'index.php?json=1&module=TRExchangeConnector&action=deletesyncs',
                        params: {
                            userId: selectedUser.get('id'),
                        },
                        success: function (response) {
                            me.getSyncUsersStore().load({
                                callback: function () {
                                    var syncsStore = me.getSyncsStore();
                                    syncsStore.getProxy().extraParams = {
                                        userId: ''
                                    };
                                    syncsStore.load();                                    
                                    me.getMainView().down('#refreshsynclist').setDisabled(true);
                                }
                            });
                        },
                        failure: function (response) {
                            alert("Request failed\n" + response.statusText);
                        }
                    });
                }
            },
            buttons: Ext.MessageBox.OKCANCEL
        });
    },
    onEncryptPassword: function (button, event) {
        this.encryptDialog = new CES.view.dialog.EncryptPassword();
        this.encryptDialog.show();
    },
    onEncryptPasswordOk: function (button, event) {
        var password = Ext.ComponentQuery.query('#unencryptedpw')[0].getValue();
        Ext.Ajax.request({
            url: 'index.php?json=1&module=TRExchangeConnector&action=encryptpassword',
            params: {
                password: password,
            },
            success: function (response) {
                var result = Ext.decode(response.responseText);
                var encryptedPasswordField = Ext.ComponentQuery.query('#encryptedpassword')[0];
                encryptedPasswordField.setValue(result.encryptedPassword);
            },
            failure: function (response) {
                alert("Request failed\n" + response.statusText);
            }
        });
    },
    onSaveSync: function(button, event) {        
        Ext.EventManager.stopEvent(event);
        var sync = this.editSyncDialog.sync;
        var startAfterField = this.editSyncDialog.down('#startafterdate');
        if(startAfterField) {
            sync.set('startAfter', startAfterField.getRawValue());
        }
        var serverField = this.editSyncDialog.down('#server');
        if(serverField) {
            sync.set('server', serverField.getRawValue());
        }
        this.editSyncDialog.close();
        this.getSyncsStore().sync();
    },
    onRefreshSyncList: function(button, event) {        
        this.getSyncsStore().load();
    },
    setDisabledSyncActions: function (disabled) {
        var me = this;
        this.syncActions.forEach(function (action) {
            me.getMainView().down(action).setDisabled(disabled);
        });
    }
});

Ext.application({
    name: 'CES',
    controllers: ['Main'],
    views: ['Main'],
    launch: function () {
        Ext.create('CES.view.Main', {
        });
        Ext.EventManager.on(window, 'resize', function () {
            Ext.ComponentQuery.query('#exchangeconfig')[0].doLayout();
        });
    }
});

