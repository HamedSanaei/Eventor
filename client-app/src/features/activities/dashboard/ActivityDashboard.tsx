import React, { useEffect } from 'react';
import { Grid } from 'semantic-ui-react';

import ActivityList from './ActivityList';
import { useStore } from './../../../app/stores/store';
import { observer } from 'mobx-react-lite';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import ActivityFilters from './ActivittFilters';

export default observer(function ActivityDashboard() {
  const { activityStore } = useStore();
  const { loadActivities, activityRegistery } = activityStore;
  useEffect(() => {
    if (activityRegistery.size <= 1) loadActivities();
  }, [activityRegistery.size, loadActivities]);

  if (activityStore.loadingInitial)
    return <LoadingComponent content="Loading activities..." />;

  return (
    <Grid>
      <Grid.Column width="10">
        <ActivityList />
        {/* 
        <List style={{ marginTop: '7em' }}>
          {activities.map((activity) => (
            <List.Item key={activity.id}>{activity.title}</List.Item>
          ))}
        </List> */}
      </Grid.Column>
      <Grid.Column width="6">
        <ActivityFilters />
      </Grid.Column>
    </Grid>
  );
});
