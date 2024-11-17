import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MUIDataTable from 'mui-datatables';
import { makeStyles } from '@material-ui/core/styles';
import LinkCell from '../components/DataGrid/LinkCell';
import { deleteCard, getCategoryCards } from '../services';
import LoadingView from '../components/LoadingView';
import { getFormattedDate } from '../util';

const useStyles = makeStyles(() => ({
  root: {},
}));

export default function CardsTable() {
  const [tableData, setTableData] = useState(null);
  const { categoryId } = useParams();
  const fetchData = async () => {
    const data = await getCategoryCards(categoryId);
    setTableData(data);
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [categoryId]);

  const columns = [
    {
      name: 'text',
      label: 'Texto',
      options: {
        filter: true,
        filterType: 'textField',
        customFilterListOptions: { render: (v) => `Texto: ${v}` },
        sort: true,
        customBodyRenderLite: function UserViewCell(dataIndex) {
          const val = tableData[dataIndex];
          const url = `/cards/${val.categoryId}/${val.PK}`;
          return (
            <LinkCell data={val.text} url={url} />
          );
        },
      },
    },
    {
      name: 'image1',
      label: 'Imagen',
      options: {
        filter: true,
        filterType: 'textField',
        customFilterListOptions: { render: (v) => `Lote: ${v}` },
        sort: true,
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
      name: 'lote',
      label: 'Lote',
      options: {
        filter: true,
        filterType: 'textField',
        customFilterListOptions: { render: (v) => `Lote: ${v}` },
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
    // selectableRows: 'single',
    selectableRows: 'multiple',
    fixedSelectColumn: false,
    print: false,
    download: false,
    onRowsDelete: (rowsDeleted) => {
      const itemIdsToDelete = rowsDeleted.data.map((i) => tableData[i.dataIndex]);
      return Promise.all(itemIdsToDelete.map((card) => deleteCard(card.PK, card.categoryId)));
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
