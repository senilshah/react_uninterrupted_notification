# unbreakable_notification
show notification from component even if route/parent component un-mounts

- This code sample is based on when we want to download a whole html page into a pdf.
- The below code has some dependencies required and that are:
  - `html2canvas` to covert any third party packages into canvas like graphs or so.
  - npm package `file-save` to store the blob response generated from the html to pdf.
  - firebase firestore for database connection.
  - here we are using `antd` component for notification and progress.
  
The basic requirement to come with this sample is, we need the functionality in any route component and not in every route. Now we cannot ask the user to stay on the same page until the whole process of downloading the pdf ends.

In react, the basic nature is, if a route changes, the DOM tree is build from scratch using the new components, as a result to which all the parent components along with child components are un-mounted and all the pending process is terminated.

So as an conclusion, we need to creat an independent component which just renders the notification process, and call it from parent component which is never going to be unmounted which is you main App.js or the main header of your site.

So below is the process that flows:

In our componentDidUpdate we listen for an event to occur that needs to show the notification.

```
componentDidUpdate(prevProps) {
  if (
    this.props.showNotification &&
    this.props.showNotification !==
      prevProps.showNotification
  ) {
    // call the notification component
    this.setState({ enableNotification: true });
  }
}
```
if our conditions match, we set the notification variable true.
```
{enableNotification && (
  <Notification
    {...propsList}}
  />
)}
```
The above part will handle the rest of the things. Our header's role ends here.

```
constructor(props) {
    super(props);
    // Not in state because it changes very fast
    this.pdfProgressDisplayed = 0;
    this.databaseListener = null;
    this.state = {
      pdfError: false,
      databaseListener: null,
      pdfProgressReference: 0,
    };
  }
```
Above, we have defined all the required varibales for showing the notification and progress.
Now, as we are using firebase, we will see for realtime updates using:
```
componentDidMount() {
    // this is to track the realtime update
    // assuming that the cloud function stores the progress into document
    let databaseListener = database
      .collection({collection})
      .doc({doc_id})
      .onSnapshot(
        function(doc) {
          let data = doc.data();
          if (conditions) {
            this.updatePdfProgressReference({...parameters});
          }
        }.bind(this)
      );
    this.setState({ databaseListener });
    this.handleSubmit();
  }
  ```
  And in `componentDidUpdate` lifecycle method, we will handle errors and post pdf download tasks.
  ```
  updateNotification = () => {
    let { pdfProgressReference, pdfError } = this.state;
    // assuming downloading the pdf contains of 4 stages, so displaying the progress from 0 to 100 % smoothly.
    let diff = Math.max(0, pdfProgressReference - this.pdfProgressDisplayed);
    if (this.pdfProgressDisplayed < 100) {
      this.pdfProgressDisplayed = Math.min(
        99,
        this.pdfProgressDisplayed + diff * 0.05 + 0.1
      );
    }
  ```
  Above, you can manipulate the business logic or calculations to update the progress of the download on-going.
  Now, its time to set up the notification UI which will be displayed:
  ```
  notification.open({
      className: 'hide-close-button',
      key: 'notification_progress',
      message: pdfError
          ? {Notification title when error occurs}
          : {Notification title},
      description: [
        pdfError
            ? {Notification description when error occurs}
          : {Notification description},
        }),
        <Progress
          key='notification_progress'
          style={{ margin: '18px 0 6px 0', display: 'block' }}
          type="circle"
          status={pdfError ? 'exception' : null}
          percent={parseFloat(this.pdfProgressDisplayed.toFixed(0))}
        />,
      ],
      duration: 0,
    });
  ```
  The key will be the most required property because, we cannot update the notification once it is showed. So using the same key every time, we just manipulate the basic nature of notification, and it seems like we are updating the existing notification.
  
  The description here is an array of the text we need to display in the notification along with the progress bar that shows the update.
  
  The duration here is set to 0 as we need to manually close the notification after completion of our download.
  
  Once the component gets mounted, we call a method to update the notification at a every defined set of interval through
  ```
  this.pdfInterval = setInterval(() => {
    this.updateNotification();
  }, 100);
  ```
  This will call the `updateNotification` method every 100th ms.
  
  ```
  updatePdfProgressReference = value => {
    let pdfProgressReference = value;
    this.setState({ pdfProgressReference });
    if (value === 100) {
      if (this.pdfInterval !== null) {
        clearInterval(this.pdfInterval);
      }
      this.pdfProgressDisplayed = 100;
      this.updateNotification();
      this.notificationClose(1500);
    }
  };
  ```
  Here we set the new progress value and check if the progess is completed i.e 100%, we will clear/destroy the notification, else it will always occupy space on the screen and will always be visible.
  
  ```
  notificationClose = waitTime => {
    let { pdfError } = this.state;
    if (pdfError) {
      this.setState({ pdfError: false });
      clearInterval(this.pdfInterval);
    }
    setTimeout(() => {
      notification.close('notification_progress');
      this.pdfProgressDisplayed = 0;
    }, waitTime);
  };
  ```
  The above method will be called in 2 scenarios, if any error occurs or if the process completes successfully. Here we close the notification.
  
    
