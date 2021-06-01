import { makeAutoObservable, runInAction } from 'mobx';
import { Activity, ActivityFormValues } from './../models/activity';
import agent from './../api/agent';
import { format } from 'date-fns';
import { store } from './store';
import { Profile } from '../models/profile';

export default class ActivityStore {
  //   title = 'Hello from MobX!';

  activityRegistery = new Map<string, Activity>();

  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInitial = false;

  /**
   *
   */
  constructor() {
    // super();

    // makeObservable(this, {
    //   title: observable,
    //   setTitle: action.bound,
    // });
    makeAutoObservable(this);
  }
  get activitiesByDate() {
    return Array.from(this.activityRegistery.values()).sort(
      (a, b) => a.date!.getTime() - b.date!.getTime()
    );
  }
  ///// yeki az mohemtarin function haye in course
  get groupedActivities() {
    // returns => [string, Activity[]][]
    return Object.entries(
      // returns => {[key: string]: Activity[];}
      this.activitiesByDate.reduce((activities, activity) => {
        const date = format(activity.date!, 'dd MMM yyyy');
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
  }

  loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();

      activities.forEach((activity) => {
        // activity.date = activity.date.split('T')[0];
        // // this.activities.push(activity);
        // this.activityRegistery.set(activity.id, activity);
        this.setActivity(activity);
      });
      this.setLoadingInitial(false);
    } catch (error) {
      console.log(error);
      this.setLoadingInitial(false);
    }
  };

  loadActivity = async (id: string) => {
    let activity = this.getAtivity(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        this.setActivity(activity);
        runInAction(() => {
          this.selectedActivity = activity;
        });
        this.setLoadingInitial(false);
        return activity;
      } catch (error) {
        console.log(error);
        this.setLoadingInitial(false);
      }
    }
  };

  private setActivity = (activity: Activity) => {
    const user = store.userStore.user;
    if (user) {
      activity.isGoing = activity.attendees!.some(
        (a) => a.username === user.userName
      );

      activity.isHost = activity.hostUsername === user.userName;
      activity.host = activity.attendees?.find(
        (x) => x.username === activity.hostUsername
      );
      //console.log(user.userName, user.displayName, user.token);
      // console.log('Host', activity.host, `username: ${user.username}`);
      // console.log('isHost:', activity.isHost);
    }

    activity.date = new Date(activity.date!);
    // this.activities.push(activity);
    this.activityRegistery.set(activity.id, activity);
  };
  private getAtivity = (id: string) => {
    return this.activityRegistery.get(id);
  };

  setLoadingInitial = (state: boolean) => {
    this.loadingInitial = state;
  };

  // selectActivity = (id: string) => {
  //   // this.selectedActivity = this.activities.find((a) => a.id === id);
  //   this.selectedActivity = this.activityRegistery.get(id);
  // };

  // cancelSelectedActivity = () => {
  //   this.selectedActivity = undefined;
  // };
  // openForm = (id?: string) => {
  //   id ? this.selectActivity(id) : this.cancelSelectedActivity();
  //   this.editMode = true;
  // };

  // closeForm = () => {
  //   this.editMode = false;
  // };

  createActivity = async (activity: ActivityFormValues) => {
    const user = store.userStore.user;
    const attendee = new Profile(user!);
    try {
      await agent.Activities.create(activity);
      const newActivity = new Activity(activity);
      newActivity.hostUsername = user!.userName;
      newActivity.attendees = [attendee];
      this.setActivity(newActivity);

      runInAction(() => {
        // this.activities.push(activity);

        this.selectedActivity = newActivity;

        // this.editMode = false;
        // this.loading = true;
      });
    } catch (error) {
      console.log(error);
      // runInAction(() => {
      //   this.loading = false;
      // });
    }
  };

  updateActivity = async (activity: ActivityFormValues) => {
    try {
      await agent.Activities.update(activity);

      runInAction(() => {
        // this.activities = [
        //   ...this.activities.filter((a) => a.id !== activity.id),
        //   activity,
        // ];

        if (activity.id) {
          let updatedActivity = {
            ...this.getAtivity(activity.id),
            ...activity,
          };
          this.activityRegistery.set(activity.id, updatedActivity as Activity);

          this.selectedActivity = this.selectedActivity as Activity;
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  deleteActivity = async (id: string) => {
    this.loading = true;
    try {
      await agent.Activities.delete(id);

      runInAction(() => {
        // this.activities = [...this.activities.filter((a) => a.id !== id)];
        this.activityRegistery.delete(id);
        // if (this.selectedActivity?.id === id) this.cancelSelectedActivity();
        this.loading = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  //   setTitle() {
  //     this.title = this.title + '!';
  //   }

  //   setTitle = () => {
  //     this.title = this.title + '!';
  //   };

  updateAttendance = async () => {
    const user = store.userStore.user;
    this.loading = true;

    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity?.isGoing) {
          this.selectedActivity.attendees =
            this.selectedActivity.attendees?.filter(
              (a) => a.username !== user?.userName
            );
          this.selectedActivity.isGoing = false;
        } else {
          const attendee = new Profile(user!);
          this.selectedActivity?.attendees?.push(attendee);
          this.selectedActivity!.isGoing = true;
        }
        this.activityRegistery.set(
          this.selectedActivity!.id,
          this.selectedActivity!
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  cancelActivityToggle = async () => {
    this.loading = true;
    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        this.selectedActivity!.isCancelled =
          !this.selectedActivity?.isCancelled;
        this.activityRegistery.set(
          this.selectedActivity!.id,
          this.selectedActivity!
        );
      });
    } catch (erorr) {
      console.log(erorr);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };
  clearSelectedActivity = () => {
    this.selectedActivity = undefined;
  };
  updateAttendeeFollowing = (username: string) => {
    this.activityRegistery.forEach((activity) => {
      activity.attendees.forEach((attendee) => {
        if (attendee.username === username) {
          attendee.following
            ? attendee.followersCount--
            : attendee.followersCount++;
          attendee.following = !attendee.following;
        }
      });
    });
  };
}
