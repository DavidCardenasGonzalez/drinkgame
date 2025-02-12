import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import { makeStyles } from '@material-ui/core/styles';
import LinkCell from '../components/DataGrid/LinkCell';
import { deleteStory, getAllStories } from '../services';
import LoadingView from '../components/LoadingView';
import { getFormattedDate } from '../util';

const useStyles = makeStyles(() => ({
  root: {},
}));

export default function StoriesTable() {
  const [tableData, setTableData] = useState(null);

  const fetchData = async () => {
    const data = await getAllStories();
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
          const url = `/story/${val.PK}`;
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
      name: 'order',
      label: 'Orden',
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: 'isPremium',
      label: 'Premium',
      options: {
        filter: false,
        sort: true,
        customBodyRenderLite: function UserViewCell(dataIndex) {
          const val = tableData[dataIndex];
          return (
            val.isPremium ? 'Si' : 'No'
          );
        },
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
    sortOrder: {
      name: 'order',
      direction: 'asc',
    },
    onRowsDelete: (rowsDeleted) => {
      const itemIdsToDelete = rowsDeleted.data.map((i) => tableData[i.dataIndex].PK);
      return Promise.all(itemIdsToDelete.map((id) => deleteStory(id)));
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
