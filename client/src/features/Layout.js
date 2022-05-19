import { Outlet, useNavigate } from 'react-router-dom'

function Layout() {

	const navigate = useNavigate()
	
	return (
		<div className='flex flex-col w-screen h-full min-h-screen gap-2 p-4 m-auto max-w-screen-2xl place-content-between min-w-fit '>
			<header className='relative flex items-center h-max'>
				<img src='/um-lg.png' alt='Um Toothpoly' className='h-12' />
				<span className='invisible mx-4 text-xs font-bold text-gray-700 sm:visible sm:text-xl' onClick={() => navigate('/')}>
					UNIVERSITI MALAYA TOOTHPOLY 🦷
				</span>
			</header>

			<div className='relative flex w-full h-full'>
				<Outlet />
			</div>

			<footer className='flex text-slate-400'>
				&copy; {new Date().getFullYear()} UM
			</footer>
		</div>
	)
}

export default Layout
