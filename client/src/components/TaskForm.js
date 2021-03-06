import React, {Component} from 'react';

class TaskForm extends Component {
	onFormSubmit(event) {
		event.preventDefault();
		console.log(this.props.authUser);
		let newTask = {
			title: event.target.taskTitle.value,
			timerDefault: event.target.timerLength.value || 25,
			timerEstimate: event.target.timerEstimate.value || 1,
			timerCount: 0,
			date: new Date()
		};
		console.log(newTask);
		if(event.target.taskDescription.value) { 
			newTask.description = event.target.taskDescription.value;

			// If task starts with '-', remove first '-'
			if(newTask.description[0] === '-') { newTask.description = newTask.description.replace('-', '') }
		}

		if(this.props.authUser) {
			newTask.username = this.props.authUser;

			// POST route to server
			fetch('https://patata-api.herokuapp.com/api/task', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				mode: 'CORS',
				body: JSON.stringify(newTask)
			})
				//TODO - if err, save newTask to localStorage until internet is available
					//? status of 200 on TasksList, heroku's /api/test, successful updateTasks ?//
			 .catch((err)=> console.error(err))
				.then(()=> window.location.hash = "#/task/list");
		} else {
			//TODO - just save locally if no account
		}
	}

	render() {
		return (
			<div className="TaskForm">
				<form className="task-form" onSubmit={(event)=> this.onFormSubmit(event)}>
					<label htmlFor="task-title">-Title-</label>
					<input type="text" id="task-title" name="taskTitle" maxLength="144" required />
					<div className="estimates">
						<label htmlFor="timer-length">&nbsp;-Timer Length (minutes)-
						<input type="number" id="timer-length" name="timerLength" maxLength="10" defaultValue="25" required /></label>
						<label htmlFor="timer-estimate">&nbsp;-Estimated Timer Count-
						<input type="number" id="timer-estimate" name="timerEstimate" maxLength="10" placeholder="2 (2 x 25min = 50min)" /></label>
					</div>

					<label htmlFor="task-description">-Description-</label>
					<textarea id="task-description" name="taskDescription" maxLength="256" placeholder="Optional description." />

					<button type="submit">Submit</button>
				</form>
			</div>
		)
	}
}

export default TaskForm;