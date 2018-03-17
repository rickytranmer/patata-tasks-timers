import React, {Component} from 'react';

class TasksList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tasks: [],
			selectedTask: '',
			mode: '',
			queryTime: 0
		}
	}

	componentDidMount() {
	  this.props.mode ? this.setState({ mode: this.props.mode }) : this.setState({ mode: 'List' });
	  if(this.props.selectedTask) {
	  	this.setState({ selectedTask: this.props.selectedTask });
	  	let differentTask = document.getElementById('different-task')||null;
	  	if(differentTask) { differentTask.style.display = 'inline'; }
	  } else {
	  	this.setState({ selectedTask: '' });
	  }
	  
	  // Grab tasks from localStorage (if they exist), until authUser
	  this.updateTasks(JSON.parse(localStorage.getItem("tasks")||null), false);

  	if(this.props.authUser) {
  		// Grab tasks from Heroku
  		this.getAllTasks()
  		  .then((res)=> { this.updateTasks({ tasks: res }, true) })
  		  .catch((err)=> console.error(err));
  	} else {
			// ^ Same thing ^ look for authUser two more times
  		setTimeout(()=> {
  			if(this.props.authUser) { 
  				this.getAllTasks()
  				 .then((res)=> { this.updateTasks({ tasks: res }, true) })
  				 .catch((err)=> console.error(err));
  			} else {
  				setTimeout(()=> { this.props.authUser ? this.getAllTasks().then((res)=> { this.updateTasks({ tasks: res }, true) }).catch((err)=> console.error(err)) : document.getElementById('loading-h2').innerHTML = 'No user found. &nbsp;Please log in or sign up by clicking "Patata" above.' }, 333);
  			}
			}, 333);
  	}
	}

	componentDidUpdate() {
		let differentTask = document.getElementById('different-task')||null;
		if(this.state.selectedTask && differentTask) { differentTask.style.display = 'inline' }
	}

	async getAllTasks() {
		//TODO - limit number of (successful?) fetches, would use local instead
		console.log('-getAllTasks');
		if(new Date().getTime() - this.props.queryTime >= 10000) {
	  	this.props.updateQueryTime(new Date().getTime());
	  	const response = await fetch(`https://patata-api.herokuapp.com/api/tasks/${this.props.authUser}`);
	  	const body = await response.json();
	  	if(response.status !== 200) { throw Error(body.message) }
			return body;
		} else {
			console.log('local');
			let localTasks = JSON.parse(localStorage.getItem("tasks")||null);
			if(localTasks) {
				return localTasks.tasks;
			} else {
				console.log('no local tasks');
				this.props.updateQueryTime(null);
				localStorage.setItem("tasks", {"tasks":[{}]});
				return null;
			}
		}
  };

  updateTasks(tasks, updateLocal) {
  	if(tasks) {
  		if(document.getElementById('loading-h2')) { document.getElementById('loading-h2').remove() }
	  	if(updateLocal) { 
	  		localStorage.setItem("tasks", JSON.stringify(tasks));
	  	}
	  	this.setState(tasks);
  	} else {
  		console.log('no tasks found');
  	}
  }

  updateSelectedTask(selectedTask) {
  	let tempTask = this.state.selectedTask;
  	this.setState({ selectedTask });
  	if(selectedTask) {
  		this.setState({ mode: 'Selected' });
  	} else {
  		this.setState({ mode: 'Select' });
  		if(this.props.timer[0].start) {
  			this.props.resetTimer();
  			document.getElementById('start-button').innerHTML = 'Restart';
  		}
  	}
  	this.props.updateSelectedTask(selectedTask);
  	// Just the one task still there?  Temporary solution reloads page.
  	// (added to fix issue of not loading all tasks after selecting, changing screens, then deselecting)
  	if(document.getElementById(tempTask)) { window.location.replace("/patata/timer") }
  }

	deleteTask(date) {
		console.log('delete:', date);
		if(this.props.authUser) {
			let deletedTask = { username: this.props.authUser };
		  // PUT route to server
		  fetch(`https://patata-api.herokuapp.com/api/task/${date}`, {
		    method: 'DELETE',
		    headers: {
		      'Content-Type': 'application/json'
		    },
		    mode: 'CORS',
		    body: JSON.stringify(deletedTask)
		  })
		    //TODO - if err, save updatedTask to localStorage (? attempt to save later or keep local ?)
		           //? status of 200 on TasksList, heroku's /api/test, successful updateTasks ?//
		   .catch((err)=> console.error(err))
		   .then((res)=> window.location.replace("/patata/task/list"));
		} else {
		  //TODO - save task locally
		  console.log('no user');
		}
	}

	submitEditTask(event, date) {
		event.preventDefault();
		console.log(date);
		console.log(this.props.authUser);
		let updateTask = {
			title: event.target.taskTitle.value,
			description: event.target.taskDescription.value || null,
			timerDefault: event.target.timerLength.value || 25,
			timerEstimate: event.target.timerEstimate.value || 1,
			timerCount: event.target.timerCount.value || 0
		};
		console.log(updateTask);

		if(this.props.authUser) {
			updateTask.username = this.props.authUser;

			// POST route to server
			fetch(`https://patata-api.herokuapp.com/api/task/${date}`, {
			  method: 'PUT',
			  headers: {
			  	'Content-Type': 'application/json'
				},
				mode: 'CORS',
			  body: JSON.stringify(updateTask)
			})
				//TODO - if err, save updateTask to localStorage until internet is available
					//? status of 200 on TasksList, heroku's /api/test, successful updateTasks ?//
	     .catch((err)=> console.error(err))
	     .then((res)=> window.location.replace("/patata/task/list"));
		} else {
			//TODO - just save locally if no account
		}
	}

	editTask(date) {
		//TODO - call EditTaskForm
		console.log('edit:', date);
		console.log(document.getElementById(date).childNodes[0]);

		// Title
		document.getElementById(date).childNodes[0].childNodes[0].innerHTML = 'Edit Task: <input name="taskTitle" placeholder="Task Title" value="'+document.getElementById(date).childNodes[0].childNodes[0].dataset.title+'" required />';
		// Description (display if hidden)
		document.getElementById(date).childNodes[0].childNodes[3].classList.remove('no-description');
		document.getElementById(date).childNodes[0].childNodes[3].childNodes[1].innerHTML = '<textarea name="taskDescription" placeholder="Description (optional)">'+(document.getElementById(date).childNodes[0].childNodes[3].childNodes[1].dataset.description || '')+'</textarea>';
		//Estimated Timer Count
		document.getElementById(date).childNodes[0].childNodes[5].innerHTML = '&nbsp;&nbsp;Estimated Timer Count: <input type="number" name="timerEstimate" value="'+document.getElementById(date).childNodes[0].childNodes[5].dataset.timerEstimate+'">';
		//Default Timer Length
		document.getElementById(date).childNodes[0].childNodes[6].innerHTML = '&nbsp;&nbsp;Default Timer Length (minutes): <input type="number" name="timerLength" value="'+document.getElementById(date).childNodes[0].childNodes[6].dataset.timerDefault+'">';
		// Remove edit & delete buttons
		document.getElementById(date).childNodes[0].childNodes[1].remove();
		document.getElementById(date).childNodes[0].childNodes[1].remove();
	

		// timerCount (hidden)
		let timerCountInput = document.createElement('div');
		timerCountInput.innerHTML = '<input type="number" name="timerCount" style="display:none;" value="'+document.getElementById(date).childNodes[0].childNodes[2].dataset.timerCount+'">';
		document.getElementById(date).childNodes[0].appendChild(timerCountInput);

		// Submit button
		let submitEditTaskButton = document.createElement('div');
		submitEditTaskButton.innerHTML = '<input type="submit" value="Save" class="edit-task-submit">';
		document.getElementById(date).childNodes[0].appendChild(submitEditTaskButton);

		// Attach li to hidden form
		document.getElementById(date).childNodes[1].classList.remove('hidden-edit');
		document.getElementById(date).childNodes[1].appendChild(document.getElementById(date).childNodes[0]);
	}

	render() {
		return(
		 <div className="TasksList">
			{ this.props.mode &&
				<h3 id="task-mode">Task {this.props.mode}</h3>
			}
			<h2 id="loading-h2">Loading...</h2>
			<ul id="task-list">

				{ this.state.tasks &&
					this.state.tasks.map((task)=> {
						return(
						 <div key={task.date}>	
							{/* LIST MODE */}
							{ this.state.mode==="List" &&
							 <li id={task.date} className="listed-task">
								<ul>
								 	<b data-title={task.title}>{task.title}</b><button className="delete-task" onClick={()=> this.deleteTask(task.date)}>X</button><span role="img" aria-label="edit button" className="edit-button" onClick={()=> this.editTask(task.date)}>📝</span>
									{ task.description && // Task Description
									 <div>
										<li>&nbsp;<i>Description:</i></li>
										<li data-description={task.description}>&nbsp;-{task.description}</li>
									 </div>
									}
									{ !task.description && // Task Description
									 <div className="no-description">
										<li>&nbsp;<i>Description:</i></li>
										<li data-description="">&nbsp;-no description</li>
									 </div>
									}
									<li data-timer-count={task.timerCount}>&nbsp;<i>Time:</i></li>
									<li data-timer-estimate={task.timerEstimate}>&nbsp;&nbsp;-Estimate: &nbsp;{task.timerEstimate} x {task.timerDefault} = {Math.round(task.timerEstimate*task.timerDefault*100)/100}min</li>
									<li data-timer-default={task.timerDefault}>&nbsp;&nbsp;-Actual: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{task.timerCount} x {task.timerDefault} = {Math.round(task.timerCount*task.timerDefault*100)/100}min</li>
								</ul>
								<form className="hidden-edit" onSubmit={(event)=> this.submitEditTask(event, task.date)}></form>
							 </li>
							}

							{/* SELECT MODE */}
							{ this.props.mode==="Select" && !this.props.selectedTask &&
							 <li id={task.date} title={task.title} data-timerestimate={task.timerEstimate} data-timerdefault={task.timerDefault} data-timercount={task.timerCount} data-description={task.description}>
								<button id={task.date+'b'} className="task-buttons" onClick={()=> this.props.updateSelectedTask(task.date)}><b>{task.title}</b></button>
							 </li>
							}

							{/* SELECTED TASK */}
							{ this.props.selectedTask && this.props.selectedTask===task.date &&
							 <li id={task.date} data-timerestimate={task.timerEstimate} data-timerdefault={task.timerDefault} data-timercount={task.timerCount} >
								<ul>
								  <b>{task.title}</b>
								 	{ task.description && // Task Description
								 	 <div>
								 		<li>&nbsp;<i>Description:</i></li>
								 		<li>&nbsp;-{task.description}</li>
								 	 </div>
								 	}
								 	<li>&nbsp;<i>Time:</i></li>
								 	<li>&nbsp;&nbsp;-Estimate: {task.timerEstimate} x {task.timerDefault} = {Math.round(task.timerEstimate*task.timerDefault*100)/100}min</li>
								 	<li>&nbsp;&nbsp;-Actual: &nbsp;&nbsp;&nbsp;&nbsp;{task.timerCount} x {task.timerDefault} = {Math.round(task.timerCount*task.timerDefault*100)/100}min</li>
								</ul>							 
							 </li>
							}
							
						 </div>
						)
					})
				}
			</ul>
			{ this.props.selectedTask &&
				<button id="different-task" onClick={()=> this.updateSelectedTask(null)}>Select Different Task</button>
			}
		 </div>
		)
	}
}

export default TasksList;