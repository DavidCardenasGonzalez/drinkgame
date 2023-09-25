import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import { makeStyles } from '@material-ui/core/styles';
import LinkCell from '../components/DataGrid/LinkCell';
import { deleteUser, getAllCategories } from '../services';
import LoadingView from '../components/LoadingView';
import { getFormattedDate } from '../util';

const useStyles = makeStyles(() => ({
  root: {},
}));

export default function CategoriesTable() {
  const [tableData, setTableData] = useState(null);

  const fetchData = async () => {
    const data = await getAllCategories();
    console.log(data);
    setTableData(data);
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const columns = [
    {
      name: 'name',
      label: 'Nombre',
      options: {
        filter: true,
        filterType: 'textField',
        customFilterListOptions: { render: (v) => `Nombre: ${v}` },
        sort: true,
        customBodyRenderLite: function UserViewCell(dataIndex) {
          const val = tableData[dataIndex];
          const url = `/category/${val.PK}`;
          return (
            <LinkCell data={val.name} url={url} />
          );
        },
      },
    },
    {
      name: 'status',
      label: 'Estado',
      options: {
        filter: false,
        filterType: 'textField',
        customFilterListOptions: { render: (v) => `Estado: ${v}` },
        sort: true,
      },
    },
    {
      name: 'date',
      label: 'Creado',
      options: {
        filter: false,
        sort: true,
        sortOrder: 'asc',
        customBodyRenderLite: (dataIndex) => {
          const val = tableData[dataIndex];
          return getFormattedDate(new Date(val.date));
        },
      },
    },
  ];

  const classes = useStyles();

  const options = {
    filterType: 'dropdown',
    selectableRows: 'single',
    fixedSelectColumn: false,
    print: false,
    download: false,
    onRowsDelete: (rowsDeleted) => {
      const itemIdsToDelete = rowsDeleted.data.map((i) => tableData[i.dataIndex].userId);
      return Promise.all(itemIdsToDelete.map((id) => deleteUser(id)));
    },
  };

  return (
    <>
      {tableData && (
        <MUIDataTable
          className={classes.root}
          data={tableData}
          columns={columns}
          options={options}
        />
      )}
      {!tableData && <LoadingView />}
    </>
  );
}
