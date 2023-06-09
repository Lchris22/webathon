import { useState, useEffect } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { db, auth } from '../firebase';
import SectionType from './SectionType';

function Notis({ type='bill', yearActive= 2023, monthActive=3 }) {
	const [data, setData] = useState([]),
			[totExpense, setTotExpense] = useState(null);

	useEffect(() => {
		// const 
		const query = 
			`/users/${auth.currentUser.uid}/${type}/${yearActive}/${monthActive}/`;
		// console.log(query)
		onValue(
			ref(db, query),
			snapshot => {
				setData([]);
				const snapval = snapshot.val();

				if(snapval !== null) {
					let dbData = [];

					// monthActive === 'all' ?
						// Object.values(snapval).map(dbMonth => Object.values(dbMonth).map(dbVal => dbData = [ ...dbData, dbVal ])):
						
						
						// Object.values(snapval).map(dbVal => dbData = [ ...dbData, dbVal ]);
						Object.values(snapval).map(dbVal => {
							if (Math.floor((new Date(dbVal.date) - new Date()) / (1000 * 60 * 60 * 24)) <= dbVal.reminder
							? true
							: false){
							  dbData = [ ...dbData, dbVal ];
							}
						  });
						setData(dbData);
						console.log(Math.floor((new Date(dbData.date) - new Date()) / (1000 * 60 * 60 * 24)) - dbData.reminder)
						console.log(dbData);
					
					let total = dbData.reduce((tot, current) => tot + parseInt(current.price), 0);
					setTotExpense(total.toLocaleString());
					let grandTotal=dbData.reduce((tot,current)=>tot+ 2000(current.price),0)
					setTotExpense(total.toLocaleString());
				}
			}
		);
	}, [type, yearActive, monthActive]);

	const handleUpdate = e => {
		update(ref(db, `/users/${auth.currentUser.uid}/${type}/${yearActive}/${monthActive}/${e.target.id}`),
				{ /* update obj */ }
			)
			.then(() => console.log('Successfully updated!'))
			.catch(err => console.log(err));
	}

	const handleDelete = e => {
		const expenseId = e.target.id,
				expenseMonth = parseInt(e.target.value),
				queryMonth = monthActive === 'all' ? expenseMonth : monthActive;
		
		if(window.confirm('You want to delete this expense?')) {
			remove(ref(db, `/users/${auth.currentUser.uid}/${type}/${yearActive}/${queryMonth}/${expenseId}`))
				.then(() => console.log('Successfully deleted!'))
				.catch(err => console.log(err));
		} else {
			return;
		}
	};
	

	return (
		<ul className="expense-list">
			{data.length !== 0 ?
				<>
					{data.map(expense => 
						<li key={expense.id}>
							<span>{expense.name}</span>
							<strong>Rs {parseInt(expense.price).toLocaleString()}</strong>
							<strong>{parseInt(expense.reminder).toLocaleString()}</strong>

							<time>{expense.date}</time>
							<button
								className="delete"
								id={expense.id}
								value={expense.date.slice(5,7)}
								onClick={handleDelete}
							/>
							{/*
							<button
								className="edit"
								id={expense.id}
								onClick={handleUpdate}
							/>
							*/}
						</li>
					)}

					<li className={type !== 'earnings' ? 'tot-expense' : 'tot-earn'}>
						<span>TOTAL:</span>
						<strong>Rs {totExpense}</strong>
					</li>
					
				</>
			:
				<li className="no-expense">
					<span>No Expenses</span>
					<strong>Rs -</strong>
					<time>gg/mm/aaaa</time>
				</li>
			}
		</ul>
	);
}

export default Notis;