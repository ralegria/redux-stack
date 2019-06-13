import React from 'react';
import PropTypes from 'prop-types';
import { withEditableTable } from '../../containers/withEditableTable';
import { USERS_TABLE } from '../../constants/tables';
import { UserListTable } from '../UserListTable/UserListTable'
import {
    createNewUser,
    updateUser,
    deleteUser
} from '../../actions/users';
import { updateClassUserCount } from '../../actions/classes';
import { isRequired } from '../../helpers/validations';
import { formHasErrors } from '../../containers/formContainer';

const EditableTable = withEditableTable(UserListTable, USERS_TABLE);
const defaultNewRecord = {
    username: '',
    description: '',
    token: '',
    newRecord: true
};

export class UserListEditableTable extends React.Component {

    rules = (dataIndex, title) => {
        const rules = {
            username: [isRequired(title)]
        }
        return rules[dataIndex];
    }

    onEditSave = (id, form, done) => {
        form.validateFields((err, values) => {
            if (formHasErrors(err)) return done(err);
            const { classId } = this.props;
            this.props.dispatch(updateUser(id, classId, values, (error) => {
                if (error) return done(error);
                done();
            }))
        });
    }

    onNewRecordSave = (form, done) => {
        const { classId } = this.props;
        form.validateFields((err, values) => {
            if (formHasErrors(err)) return done(err);
            this.props.dispatch(createNewUser(classId, values, (error) => {
                if (error) {
                    return done(error);
                }
                this.props.dispatch(updateClassUserCount(classId, 1));
                done();
            }));
        });
    }

    onDelete = (id) => {
        const { classId } = this.props;
        this.props.dispatch(deleteUser(classId, id, (error) => {
            if (error) return;
            this.props.dispatch(updateClassUserCount(classId, -1));
        }));
    }

    render() {
        const { errors } = this.props;
        const onCell = (dataIndex, title, inputType, inputclass) => (record) => {
            const { reduxForm = {} } = this.props;
            const table = reduxForm[USERS_TABLE];
            return ({
                record,
                inputType,
                inputclass,
                dataIndex,
                title,
                editing: (table && table.editingId === record['userId']) || record['newRecord'],
                saving: table && table.saving
            });
        };
        return <EditableTable
            {...this.props}
            errors={errors}
            rules={this.rules}
            defaultNewRecord={defaultNewRecord}
            onCell={onCell}
            onEditSave={this.onEditSave}
            onDelete={this.onDelete}
            onNewRecordSave={this.onNewRecordSave}
        />

    }
}

UserListEditableTable.propTypes = {
    done: PropTypes.func,
    record: PropTypes.object,
    values: PropTypes.object,
    dataIndex: PropTypes.string,
    title: PropTypes.string,
    inputType: PropTypes.string,
    inputclass: PropTypes.string,
}