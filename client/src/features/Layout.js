import { Outlet, useNavigate } from 'react-router-dom'

function Layout() {

	const navigate = useNavigate()
	
	return (
		<div className='flex flex-col w-screen h-full min-h-screen gap-2 p-4 m-auto max-w-screen-2xl place-content-between min-w-fit'>
			<header className='relative flex items-center h-max justify-around'>
				<img src='/toothpoly.png' alt='Um Toothpoly' className='h-20 mt-4' />
				{/* <span className='invisible ml-4 text-xs font-bold text-gray-700 sm:visible sm:text-xl' onClick={() => navigate('/')}>
					TOOTHPOLY 🦷
				</span> */}
				{/* <sup>&nbsp;Web Edition</sup> */}
			</header>

			<div className='relative flex w-full h-full flex-1'>
				<Outlet />
			</div>

			<footer className='flex flex-col text-slate-400 leading-tight font-jakarta text-sm justify-around gap-2'>
				<div className='m-auto'>
				&copy; {new Date().getFullYear()}&nbsp;Universiti Malaya 
				</div>
				<div className='m-auto text-center'>
				This online game was developed by a group of researcher from Universiti Malaya and the project was funded by the Protoype Research Grant Scheme (PR002-2019B), Ministry of Higher Education, Malaysia.
				</div>
			</footer>
		</div>
	)
}

export default Layout
