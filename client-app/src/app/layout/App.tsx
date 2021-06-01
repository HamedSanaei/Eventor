import React, { useEffect } from 'react';
import { Container } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';

import { observer } from 'mobx-react-lite';
import { Route, Switch, useLocation } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from './../../features/activities/details/ActivityDetails';
import TestErrors from './../../features/errors/testError';
import { ToastContainer } from 'react-toastify';
import NotFound from './../../features/errors/NotFound';
import ServerError from '../../features/errors/ServerError';
import LoginForm from './../../features/users/LoginForm';
import { useStore } from './../stores/store';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';
import ProfilePage from './../../features/profiles/ProfilePage';

function App() {
  const location = useLocation();
  const { commonStore, userStore } = useStore();

  useEffect(() => {
    if (commonStore.token) {
      userStore.getUser().finally(() => commonStore.setAppLoaded());
    } else {
      commonStore.setAppLoaded();
    }
  }, [commonStore, userStore]);

  if (!commonStore.appLoaded)
    return <LoadingComponent content="Loading app ..." />;

  // componentDidMount() {
  //   axios.get('http://localhost:5000/api/values').then((response) => {
  //     this.setState({ values: response.data });
  //   });
  // this.setState({
  //   values: [
  //     { id: 1, name: "value 101" },
  //     { id: 2, name: "value 102" },
  //     { id: 3, name: "value 103" },
  //   ],
  // });

  // function handleSelectActivity(id: string) {
  //   setSelectedActivity(activities.find((x) => x.id === id));
  // }

  // function handleCancelSelectActivity() {
  //   setSelectedActivity(undefined);
  // }

  // function handleFormOpen(id?: string) {
  //   id ? handleSelectActivity(id) : handleCancelSelectActivity();
  //   setEditMode(true);
  // }

  // function handleFormClose() {
  //   setEditMode(false);
  // }

  return (
    <>
      <ToastContainer position="bottom-right" hideProgressBar />
      <ModalContainer />
      <Route exact path="/" component={HomePage} />
      <Route
        path="/(.+)"
        render={() => (
          <>
            <NavBar />
            <Container style={{ marginTop: '7em' }}>
              <Switch>
                <Route exact path="/activities" component={ActivityDashboard} />
                <Route path="/activities/:id" component={ActivityDetails} />
                <Route
                  key={location.key}
                  path={['/createActivity', '/manage/:id']}
                  component={ActivityForm}
                />
                <Route path="/profiles/:username" component={ProfilePage} />
                <Route path="/errors" component={TestErrors} />
                <Route path="/server-error" component={ServerError} />
                <Route path="/login" component={LoginForm} />

                <Route component={NotFound} />
              </Switch>
            </Container>
          </>
        )}
      />
      ;{/* <Header as='h2' icon='users' content='Reactivities'/> */}
    </>
  );
}

export default observer(App);
