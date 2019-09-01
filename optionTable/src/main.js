var columnDefs = [
    {
      headerName: "Type",
      field: 'type',
      filter: 'agSetColumnFilter',
      width: 600,
      rowGroup:true,
      hide: true,
    },
    {
      headerName: "Exp",
      field: 'exp',
      filter: 'agSetColumnFilter',
      width: 600,
      rowGroup:true,
      hide: true,
    },
    {
      headerName: "Symbol",
      field: 'symbol',
      filter: 'agSetColumnFilter',
      width: 600,
      rowGroup:true,
      hide: true,
    },
    {
      headerName: "Name",
      field: 'name',
      filter: 'agSetColumnFilter',
      width: 600,
    },
    // {headerName: "Security Type", field: "Security Type", width: 350},
    {headerName: "Position", field: "Position Type", width: 350},
    {headerName: "Price", field: "price", filter: 'agNumberColumnFilter', width: 350},
    {
      headerName: "Strike",
      field: 'strike',
      filter: 'agNumberColumnFilter',
      width: 600,
      // aggFunc: 'avg',
      // enableValue: true,
      // allowedAggFuncs: ['avg'],
    },
    {
      headerName: "Quantity",
      field: 'quantity',
      filter: 'agNumberColumnFilter',
      width: 600,
      // aggFunc: 'sum',
      // enableValue: true,
      // allowedAggFuncs: ['sum', 'avg'],
    },
    {
      headerName: "Notional Value",
      field: 'notionalValue',
      filter: 'agNumberColumnFilter',
      width: 600,
      aggFunc: 'sum',
      enableValue: true,
      allowedAggFuncs: ['sum', 'avg'],
    },
];

var gridOptions = {
    rowData: [],
    defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true,
        filterParams: {
          debounceMs: 200,
        },
    },
    columnDefs: columnDefs,
    animateRows: true,
    enableRangeSelection: true,
    groupUseEntireRow:false,
    onGridReady: function () {
        gridOptions.api.sizeColumnsToFit();
    },
    groupIncludeFooter: true,
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
            },
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
            }
        ],
        defaultToolPanel: 'filters'
    },
    statusBar: {
      statusPanels: [
        {
          statusPanel: 'agTotalAndFilteredRowCountComponent',
          align: 'left',
        },
        {
          statusPanel: 'agTotalRowCountComponent',
          align: 'center',
        },
        { statusPanel: 'agFilteredRowCountComponent' },
        { statusPanel: 'agSelectedRowCountComponent' },
        { statusPanel: 'agAggregationComponent' },
      ],
    },
    autoGroupColumnDef: {
      width: 400,
    },
};

function handleFile(target) {
  var files = target.files;
  var file = files[0];
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    var csv = event.target.result.split("Symbol/")[1];
    var rowData = $.csv.toObjects(csv).map(reformat);
    gridOptions.api.setRowData(rowData);
  }
}

function handleResize() {
  gridOptions.api.sizeColumnsToFit();
}

function reformat(transaction) {
  transaction.type = transaction['Name'].split(' ')[0];
  transaction.symbol = transaction['CUSIP'].split(' ')[0];
  transaction.name = transaction['Name'].split(' $')[0].split(' ').splice(1).join(' ');
  transaction.exp = transaction['Name'].split('EXP ')[1];
  transaction.price = Number(transaction['Price'].split('$')[1]);
  transaction.strike = Number(transaction['Name'].split(' EXP ')[0].split('$')[1]);
  transaction.quantity = Number(transaction['Quantity'].replace(/[\(\)\,]/g,''));
  transaction.notionalValue = transaction.strike * transaction.quantity * 100;
  return transaction;
}

function expandAll() {
    gridOptions.api.expandAll();
}

function collapseAll() {
    gridOptions.api.collapseAll();
}

function exportFile() {
    var params = {
        fileName: 'optionReport',
        sheetName: 'notionalValue'
    };
    gridOptions.api.exportDataAsExcel(params);
}

document.addEventListener("DOMContentLoaded", function () {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
