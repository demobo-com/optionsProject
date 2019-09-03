console.error = () => {};

var columnDefs = [
    {
      headerName: "Type",
      field: 'type',
      filter: 'agSetColumnFilter',
      width: 100,
      rowGroup:true,
      hide: true,
    },
    {
      headerName: "Symbol",
      field: 'symbol',
      filter: 'agSetColumnFilter',
      width: 100,
      rowGroup:true,
      hide: true,
      sort: 'asc',
    },
    {
      headerName: "Exp",
      field: 'exp',
      // valueFormatter: dateFormatter,
      filter: 'agSetColumnFilter',
      width: 100,
      rowGroup:true,
      hide: true,
      sort: 'asc',
    },
    {
      headerName: "Name",
      field: 'name',
      filter: 'agSetColumnFilter',
      width: 100,
    },
    { headerName: "Security Type", field: "Security Type", width: 100, hide: true },
    { headerName: "Position", field: "Position Type", width: 100, hide: true },
    { headerName: "Price", field: "price", filter: 'agNumberColumnFilter', width: 100, hide: true},
    {
      headerName: "Strike",
      field: 'strike',
      valueFormatter: moneyFormatter,
      filter: 'agNumberColumnFilter',
      width: 100,
      // aggFunc: 'avg',
      // enableValue: true,
      // allowedAggFuncs: ['avg'],
    },
    {
      headerName: "Quantity",
      field: 'quantity',
      valueFormatter: numberFormatter,
      filter: 'agNumberColumnFilter',
      width: 100,
      // aggFunc: 'sum',
      // enableValue: true,
      // allowedAggFuncs: ['sum', 'avg'],
    },
    {
      headerName: "Notional Value",
      field: 'notionalValue',
      valueFormatter: moneyFormatter,
      filter: 'agNumberColumnFilter',
      width: 100,
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
    // defaultGroupSortComparator: function(nodeA, nodeB) {
    //     if (nodeA.key < nodeB.key) {
    //         return -1;
    //     } else if (nodeA.key > nodeB.key) {
    //         return 1;
    //     } else {
    //         return 0;
    //     }
    // }
};

function dateFormatter(params) {
  return params.value && new Date(params.value).toLocaleDateString('en-US');
}

function numberFormatter(params) {
  return params.value && params.value.toLocaleString('en-US');
}

function moneyFormatter(params) {
  return params.value && params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function handleFile(target) {
  var files = target.files;
  var file = files[0];
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    var csv = event.target.result.split("Symbol/")[1];
    var rowData = $.csv.toObjects(csv)
      .map(reformat)
      .sort((a, b) => {
        const [ amonth, aday, ayear ] = a.exp.split('/');
        aexp = [ ayear, amonth, aday ].join('/');
        const [ bmonth, bday, byear ] = b.exp.split('/');
        bexp = [ byear, bmonth, bday ].join('/');
        if (a.symbol > b.symbol) return 1;
        else if (a.symbol < b.symbol) return -1;
        else if (aexp > bexp) return 1;
        else if (aexp < bexp) return -1;
        return 0;
      });
    console.log(rowData)
    gridOptions.api.setRowData(rowData);
    // gridOptions.api.expandAll();
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
  transaction.strike = Math.abs(Number(transaction['Name'].split(' EXP ')[0].split('$')[1]));
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
