import { Button, Card, Col, Collapse, Divider, Form, Input, Modal, Popconfirm, Radio, Row, Select, Switch, Table, Tooltip, message, notification } from 'antd';
import { DeleteOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons';
import { IntlShape, useIntl, useModel } from 'umi';
import { LoadingObject, modalFormLayout, tacitPagingProps } from '@/utils/utils';
import React, { useEffect, useState } from 'react';

import { ColumnProps } from 'antd/lib/table/Column';
import ColumnTitle from '@/components/ColumnTitle';
import IconFont from '@/components/IconFont';
import { PageContainer } from '@ant-design/pro-layout';
import { PaginationProps } from 'antd/lib/pagination';
import { Store } from 'antd/lib/form/interface';
import dayjs from 'dayjs';
import { fixValue } from './operation';
import { useForm } from 'antd/lib/form/util';

export default (): React.ReactNode => {
  const intl: IntlShape = useIntl();
  const [searchForm] = useForm();
  const [modalForm] = useForm();

  const { itemList, loading, total, current, pageSize, getUserTable, addUser, editUser, deleteUser, getUserForm, loadUserForm } = useModel('userList');
  const { loading: roleLoading, roles, getRoles } = useModel('role');

  const [modalShow, setModalShow] = useState<boolean>(false);
  const [modalModel, setModalModel] = useState<string>('create');
  const [modalTitle, setModalTitle] = useState<string>('user.modal.title.create');
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    getRoles();
  }, []);

  useEffect(() => {
    getUserTable({ pageIndex: 1, pageSize: 10 });
  }, []);

  const columns: Array<ColumnProps<Types.UserTable>> = [
    { title: <ColumnTitle name={intl.formatMessage({ id: 'user.table.columns.username' })} />, dataIndex: 'userName', key: 'userName', align: 'center' },
    { title: <ColumnTitle name={intl.formatMessage({ id: 'user.table.columns.nickname' })} />, dataIndex: 'nickName', key: 'nickName', align: 'center' },
    {
      title: <ColumnTitle name={intl.formatMessage({ id: 'user.table.columns.create.time' })} />,
      dataIndex: 'createdTime',
      key: 'createdTime',
      align: 'center',
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : undefined
    },
    {
      title: <ColumnTitle name={intl.formatMessage({ id: 'user.table.columns.modify.time' })} />,
      dataIndex: 'lastModifierTime',
      key: 'lastModifierTime',
      align: 'center',
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : undefined
    },
    {
      title: <ColumnTitle name={intl.formatMessage({ id: 'user.table.columns.is.system' })} />,
      dataIndex: 'isSystem',
      key: 'isSystem',
      align: 'center',
      render: (text: boolean, row, index) => {
        return text === true ? '是' : '否';
      }
    },
    { title: <ColumnTitle name={intl.formatMessage({ id: 'user.table.columns.description' })} />, dataIndex: 'description', key: 'description', align: 'center' },
    {
      title: <ColumnTitle name={intl.formatMessage({ id: 'user.table.columns.operating' })} />,
      key: 'operation',
      align: 'center',
      render: (_: string, record: Types.UserTable) => (
        <div>
          <Tooltip placement="bottom" title={intl.formatMessage({ id: 'user.table.columns.tooltip.delete' })}>
            <Popconfirm placement="top" title={intl.formatMessage({ id: 'user.table.columns.popconfirm.title' })} onConfirm={() => onDeleteClick(record.id!)} icon={<WarningOutlined />}>
              <DeleteOutlined style={{ color: 'red', fontSize: 16 }} />
            </Popconfirm>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip placement="bottom" title={intl.formatMessage({ id: 'user.table.columns.tooltip.modify' })}>
            <EditOutlined onClick={() => onEditClick(record)} />
          </Tooltip>
        </div>
      )
    }
  ];

  const onDeleteClick = (id: string) => {
    deleteUser(id)
      .then(() => {
        message.success(intl.formatMessage({ id: 'user.function.delete.click.success' }));
        getUserList(1, 10);
      })
      .catch((error: Error) => message.error(`${intl.formatMessage({ id: 'user.function.delete.click.fail' })}:${error}`));
  };

  const onEditClick = (record: Types.UserTable) => {
    setModalModel('edit');
    setModalTitle('user.modal.title.modify');
    setItemId(record.id!);
    getUserForm(record.id!).then(() => {
      let data = loadUserForm;
      modalForm.setFieldsValue({
        username: data?.userName,
        nickname: data?.nickName,
        sex: data?.sex,
        isSystem: data?.isSystem,

        roles: data?.roleIds,
        description: data?.description
      });
    });

    setModalShow(true);
  };

  const handleReset = () => {
    searchForm.resetFields();
    getUserList(1, 10);
  };

  const handleSearch = (values: Store) => getUserList(1, 10, values);

  const onCreateClick = () => {
    setModalModel('create');
    setModalTitle('user.modal.title.create');
    modalForm.setFieldsValue({
      username: '',
      nickname: '',
      sex: 0,
      isSystem: false,
      password: '',
      roles: '',
      description: ''
    });
    setItemId('');
    setModalShow(true);
  };

  const onModalOK = () => {
    if (modalModel === 'create') {
      modalForm.validateFields().then((values: Store) => {
        const { username, nickname, sex, isSystem, password, roles, description } = values;
        let passwordTemp = password ? { passwordHash: password } : {};
        let rolesIds: string[] = [];
        if (roles instanceof Array) {
          rolesIds = roles;
        } else {
          rolesIds.push(roles);
        }
        let args = {
          userName: username,
          nickName: nickname,
          // createdTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          isSystem: isSystem,
          description: description,
          sex: sex,
          roleIds: rolesIds,
          ...passwordTemp
        };
        addUser(args)
          .then(() => {
            message.success(intl.formatMessage({ id: 'user.function.add.user.success' }));
            getUserList(1, 10);
          })
          .catch((error: Error) =>
            notification.error({
              message: intl.formatMessage({ id: 'user.function.add.user.fail.message' }),
              description: `${intl.formatMessage({ id: 'user.function.add.user.fail.description' })} ${error}`
            })
          );
      });
    } else {
      modalForm.validateFields().then((values: Store) => {
        debugger;
        const { username, nickname, sex, isSystem, roles, description } = values;
        let rolesIds: string[] = [];
        if (roles instanceof Array) {
          rolesIds = roles;
        } else {
          rolesIds.push(roles);
        }
        let args = {
          userName: username,
          nickName: nickname,
          // createdTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          isSystem: isSystem,
          description: description,
          sex: sex,
          roleIds: rolesIds
        };
        editUser({ ...args, id: itemId })
          .then(() => {
            message.success(intl.formatMessage({ id: 'user.function.modify.user.success' }));
            getUserList(1, 10);
          })
          .catch((error: Error) =>
            notification.error({
              message: intl.formatMessage({ id: 'user.function.modify.user.fail.message' }),
              description: `${intl.formatMessage({ id: 'user.function.modify.user.fail.description' })} ${error}`
            })
          );
      });
    }
    setModalShow(false);
  };

  const getUserList = (current: number, pageSize: number, args: any = {}) => {
    getUserTable(fixValue({ pageIndex: current, pageSize, ...args })).catch((error: Error) => {
      notification.error({
        message: intl.formatMessage({ id: 'user.function.get.user.list.fail.message' }),
        description: `${intl.formatMessage({ id: 'user.function.get.user.list.fail.description' })} ${error}`
      });
    });
  };

  const pagination: PaginationProps = {
    ...tacitPagingProps,
    total,
    current,
    pageSize,
    onShowSizeChange: (current: number, pageSize: number) => {
      let args = searchForm.getFieldsValue(['UserName', 'NickName']);
      getUserList(current, pageSize, args);
    },
    onChange: (page: number, pageSize?: number) => {
      let args = searchForm.getFieldsValue(['UserName', 'NickName']);
      getUserList(page, pageSize ?? 10, args);
    }
  };

  return (
    <PageContainer>
      <Card>
        <Collapse accordion>
          <Collapse.Panel header={intl.formatMessage({ id: 'user.collapse.panel_1.header' })} key="1">
            <Form onFinish={handleSearch} form={searchForm}>
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item name="UserName" label={intl.formatMessage({ id: 'user.form.item.username' })} style={{ marginBottom: 0 }}>
                    <Input allowClear placeholder={intl.formatMessage({ id: 'user.input.placeholder' })} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="NickName" label={intl.formatMessage({ id: 'user.form.item.nickname' })} style={{ marginBottom: 0 }}>
                    <Input allowClear placeholder={intl.formatMessage({ id: 'user.input.placeholder' })} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <span style={{ float: 'right' }}>
                    <Button type="primary" htmlType="submit">
                      {intl.formatMessage({ id: 'user.button.submit' })}
                    </Button>
                    <Button style={{ marginLeft: 14 }} onClick={handleReset}>
                      {intl.formatMessage({ id: 'user.button.reset' })}
                    </Button>
                  </span>
                </Col>
              </Row>
            </Form>
          </Collapse.Panel>
        </Collapse>
      </Card>
      <Card>
        <Button type="primary" style={{ marginBottom: 15 }} onClick={onCreateClick}>
          {intl.formatMessage({ id: 'user.button.create' })}
        </Button>
        <Table loading={LoadingObject(loading)} rowKey={(record:Types.UserTable) => record?.id!} tableLayout="fixed" size="small" dataSource={itemList} pagination={pagination} columns={columns}></Table>
      </Card>
      <Modal
        visible={modalShow}
        title={intl.formatMessage({ id: modalTitle })}
        cancelText={intl.formatMessage({
          id: 'user.modal.cancel.text'
        })}
        okText={intl.formatMessage({
          id: 'user.modal.ok.text'
        })}
        destroyOnClose
        centered
        width={550}
        onCancel={() => {
          modalForm.resetFields();
          setModalShow(false)
        }}
        onOk={onModalOK}
      >
        <Form {...modalFormLayout} form={modalForm}>
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'user.modal.form.item.username.rule.message' })
              }
            ]}
            label={intl.formatMessage({ id: 'user.modal.form.item.username.label' })}
          >
            <Input allowClear placeholder={intl.formatMessage({ id: 'user.modal.form.item.username.input.placeholder' })} />
          </Form.Item>
          <Form.Item
            name="nickname"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'user.modal.form.item.nickname.rule.message' })
              }
            ]}
            label={intl.formatMessage({ id: 'user.modal.form.item.nickname.label' })}
          >
            <Input allowClear placeholder={intl.formatMessage({ id: 'user.modal.form.item.nickname.input.placeholder' })} />
          </Form.Item>
          <Form.Item name="sex" label={intl.formatMessage({ id: 'user.modal.form.item.sex.label' })}>
            <Radio.Group>
              <Radio value={0}>
                <Tooltip placement="bottom" title={intl.formatMessage({ id: 'user.modal.form.item.sex.man' })}>
                  <IconFont type="icon-man" />
                </Tooltip>
              </Radio>
              <Radio value={1}>
                <Tooltip placement="bottom" title={intl.formatMessage({ id: 'user.modal.form.item.sex.woman' })}>
                  <IconFont type="icon-woman" />
                </Tooltip>
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="isSystem" label={intl.formatMessage({ id: 'user.modal.form.item.is.system' })} valuePropName="checked">
            <Switch checkedChildren={intl.formatMessage({ id: 'user.modal.form.item.is.system.check' })} unCheckedChildren={intl.formatMessage({ id: 'user.modal.form.item.is.system.un.check' })} />
          </Form.Item>
          {itemId == '' && (
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'user.modal.form.item.password.rule.message' })
                }
              ]}
              label={intl.formatMessage({ id: 'user.modal.form.item.password.label' })}
            >
              <Input.Password allowClear placeholder={intl.formatMessage({ id: 'user.modal.form.item.password.input.placeholder' })} />
            </Form.Item>
          )}

          <Form.Item name="roles" label={intl.formatMessage({ id: 'user.modal.form.item.roles.label' })}>
            <Select loading={roleLoading} placeholder={intl.formatMessage({ id: 'user.modal.form.item.roles.select.placeholder' })}>
              {roles?.map((item: Types.Role) => (
                <Select.Option key={item.value} value={item.value!}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label={intl.formatMessage({ id: 'user.modal.form.item.description.label' })} style={{ marginBottom: 0 }}>
            <Input.TextArea allowClear placeholder={intl.formatMessage({ id: 'user.modal.form.item.description.placeholder' })} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};
