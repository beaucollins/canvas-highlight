import map from 'lodash/map';

if ( window.top === window ) {
	const when = test => fn => ( ... args ) => test( ... args ) ? fn( ... args ) : args[ 0 ];

	const flowRight = ( ... fns ) => ( ... args ) => fns.slice( 1 ).reduce( ( result, fn ) => fn( result ), fns[0]( ... args ) )
	const fn_map = ( ... fns ) => ( ... args ) => fns.map( fn => fn( ... args ) )
	const not = fn => ( ... args ) => ! fn( ... args )
	const isTrue = v => v === true;
	const whenActive = when( isTrue )
	const whenInactive = when( not( isTrue ) )
	const whenToggle = when( ( { name } ) => 'toggle' === name )
	const toggle = initial => () => {
		return initial = !initial, initial
	};

	const attach = ( node, listeners ) => {
		map( listeners, ( fn, event ) => node.addEventListener( event, fn ) )
	}
	const detach = ( node, listeners ) => {
		map( listeners, ( fn, event ) => node.removeEventListener( event, fn ) )
	}

	const acquireListeners = {
		mouseover: e => {
			console.log( 'over', e.relatedTarget );
		},
		mouseout: e => {
			console.log( 'out', e.relatedTarget );
		}
	}

	const canvas = document.createElement( 'canvas' );
	map( {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: '100%',
		zIndex: '9999'
	}, ( value, key ) => canvas.style[key] = value );

	let mousedown = false;
	const whenMouseDown = when( () => mousedown === true )
	const rect = {a: {x: 0, y: 0 }, b: { x: 0, y: 0 } };
	const draw = ( rect ) => {
		
	}
	const canvasListeners = {
		mousedown: fn_map( () => mousedown = true, ( { clientX, clientY } ) => rect.a = { x: clientX, y: clientY } ),
		mouseup: () => mousedown = false,
		// mousemove: fn_map(
		// 	whenMouseDown( ( { clientX, clientY } ) => rect.b = { x: clientX, y: clientY } ),
		// 	() => {
		// 		const { width, height } = canvas.getBoundingClientRect();
		// 		ctx.clearRect( 0, 0, width, height );
		// 		ctx.fillStyle = 'green'
		// 		ctx.fillRect( 0, 0, width * 0.75, height * 0.75 );
		// 		ctx.strokeStyle = 'red';
		// 		ctx.lineWidth = 3;
		// 		const args = [ rect.a.x, rect.a.y, rect.b.x - rect.a.x, rect.b.y - rect.a.y ];
		// 		ctx.clearRect.apply( ctx, args );
		// 		ctx.strokeRect.apply( ctx, args );
		// 		console.log( 'done?' )
		// 		console.log( 'clear and stroke', rect, args );
		// 	}
		// )
	}

	const activate = () => {
		document.body.appendChild( canvas );
		attach( canvas, canvasListeners );
		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext( '2d' );

		ctx.clearRect( 0, 0, width, height );
		ctx.save();
		ctx.globalAlpha = 0.4;
		ctx.fillStyle = 'rgba( 0, 0%, 0% )'
		ctx.fillRect( 0, 0, width * 0.75, height * 0.75 );
		ctx.restore();
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 3;
		const args = [ 10, 10, 200, 200 ];
		ctx.clearRect.apply( ctx, args );
		ctx.strokeRect.apply( ctx, args );
		console.log( 'done?' )
		console.log( 'clear and stroke', rect, args );

	}

	const deactivate = () => {
		document.body.removeChild( canvas );
		detach( canvas, canvasListeners );
	}

	safari.self.addEventListener( 'message', whenToggle( flowRight(
		toggle( false ),
		fn_map(
			whenActive( activate ),
			whenInactive( deactivate )
		)
	) ) );
}
