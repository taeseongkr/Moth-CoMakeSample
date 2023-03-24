export class Observer {
  static instance

  constructor(params) {
    this.observer = [{ notify: () => ({}) }];
    this.eventList = [];
  }

  static getInstance() {
    if (Observer.instance) return Observer.instance;
    Observer.instance = new Observer()
    Observer.instance.observerInterface();
    return Observer.instance;
  }

  observerInterface() {
    const registerObserver = getObserver => {
      this.observer = getObserver;
    };

    const observer = {
      notify: (id, massage) => {
        this.eventList.map(event => {
          const cmd = event.find((command) => command.id === id)
          if (cmd) {
            cmd.func(massage)
          }
        });
      }
    };

    registerObserver(observer);
  };

  notifyObserver(id, massage) {
    if (massage) {
      console.log(id, massage);
      this.observer.notify(id, massage);
      return;
    }
    this.observer.notify(id)
  };

  /**
   * @param eventList
   */

  addObserverEvent(eventList) {
    this.eventList.push(eventList)
    this.observerInterface();
  };
}