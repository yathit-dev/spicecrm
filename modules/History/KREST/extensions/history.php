<?php


$app->group('/module/History', function () use ($app) {
    $app->get('/:parentmodule/:parentid/', function ($parentmodule, $parentid) use ($app) {
        global $db;

        $retArray = array();

        $getParams = $app->request->get();
        $start = $getParams['start'] ?: 0;
        $limit = $getParams['limit'] ?: 5;

        $queryArray[] = "SELECT calls.id, date_start sortdate, 'Calls' module FROM calls LEFT JOIN calls_contacts ON calls.id = calls_contacts.call_id where ((parent_type = '$parentmodule' and parent_id = '$parentid') OR calls_contacts.contact_id = '$parentid' ) and calls.deleted = 0 and status not in ('Planned')";
        $queryArray[] = "SELECT meetings.id, date_start sortdate, 'Meetings' module FROM meetings LEFT JOIN meetings_contacts on meetings.id = meetings_contacts.meeting_id where ((parent_type = '$parentmodule' and parent_id = '$parentid') OR meetings_contacts.contact_id='$parentid') and meetings.deleted = 0 and status not in ('Planned')";
        $queryArray[] = "SELECT notes.id, date_entered sortdate, 'Notes' module FROM notes where ((parent_type = '$parentmodule' and parent_id = '$parentid') OR notes.contact_id='$parentid') and notes.deleted = 0";
        $queryArray[] = "SELECT id, date_due sortdate, 'Tasks' module FROM tasks where ((parent_type = '$parentmodule' and parent_id = '$parentid') or contact_id = '$parentid') and deleted = 0 and status not in ('In Progress', 'Not Started', 'Pending Input')";
        $queryArray[] = "SELECT id, date_entered sortdate, 'Emails' module FROM emails where parent_type = '$parentmodule' and parent_id = '$parentid' and deleted = 0";
        $queryArray[] = "SELECT emails.id, date_entered sortdate, 'Emails' module FROM emails, emails_beans where emails.id = emails_beans.email_id and emails_beans.bean_id = '$parentid' and emails.deleted = 0 and emails_beans.deleted = 0";

        //echo implode(' UNION ALL ', $queryArray);
        //return;

        $objects = $db->limitQuery('select id, module from (' . implode(' UNION ALL ', $queryArray) . ') unionresult order by sortdate DESC', $start, $limit);

        $count = 0;
        if ($getParams['count']) {
            $historyCount = $db->fetchByAssoc($db->query('select count(id) itemcount from (' . implode(' UNION ALL ', $queryArray) . ') unionresult'));
            $count = $historyCount['itemcount'];
        }

        while ($object = $db->fetchByAssoc($objects)) {

            $bean = BeanFactory::getBean($object['module'], $object['id']);

            foreach ($bean->field_defs as $fieldname => $fielddata) {
                if ($bean->$fieldname)
                    $object['data'][$fieldname] = $bean->$fieldname;
            }

            $aclActions = ['detail', 'edit', 'delete'];
            foreach ($aclActions as $aclAction) {
                $object['data']['acl'][$aclAction] = $bean->ACLAccess($aclAction);
            }

            $retArray[] = $object;
        }

        echo json_encode(array(
                'items' => $retArray,
                'count' => $count
            )
        );

    });

});