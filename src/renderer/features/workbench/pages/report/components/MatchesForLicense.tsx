import React from 'react';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import {
  AutoSizer,
  Column,
  Table,
} from 'react-virtualized';
import IconComponent from '../../../components/IconComponent/IconComponent';

const useStyles = makeStyles({
  headerColumn: {
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: '1.5rem',
    color: 'rgba(0, 0, 0, 0.87)',
    textTransform: 'capitalize',
    height: '100%',
    alignItems: 'center',
    display: 'flex',
  },
  row: {
    fontWeight: 400,
    fontSize: '0.75rem',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
    color: 'rgba(0, 0, 0, 0.87)',
  },
});

export default function MatchesForLicense({ components }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <AutoSizer>
      {({ height, width }) => (
        <Table
          height={height}
          width={width}
          rowHeight={38}
          headerHeight={40}
          rowCount={components.length}
          rowGetter={({ index }) => components[index]}
          headerClassName={classes.headerColumn}
          rowClassName={classes.row}
        >
          <Column
            label={t('Table:Header:Component')}
            dataKey="component"
            width={500}
            flexGrow={10}
            flexShrink={0}
            cellRenderer={({ rowData }) => (
              <div className="table-cell">
                <IconComponent name={rowData.vendor} size={24} />
                <div className="d-flex flex-column">
                  <span>{rowData.name}</span>
                  <span className="small">{rowData.purl}</span>
                </div>
              </div>
            )}
          />
          <Column label={t('Table:Header:URL')} dataKey="url" width={300} flexGrow={1} flexShrink={0} />
          <Column label={t('Table:Header:Vendor')} dataKey="vendor" width={100} flexGrow={1} flexShrink={0} />
          <Column label={t('Table:Header:Version')} dataKey="version" width={100} flexGrow={1} flexShrink={0} />
          <Column label={t('Table:Header:License')} dataKey="license" width={100} flexGrow={1} flexShrink={0} />

        </Table>
      )}
    </AutoSizer>
  );
}
