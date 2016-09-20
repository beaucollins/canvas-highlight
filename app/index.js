
const div = document.createElement( 'div' );
const field = document.createElement( 'input' )
const link = document.createElement( 'a' );

field.setAttribute( 'type', 'file' );

document.body.appendChild( div );
div.appendChild( field );
const editor = window.screenshot( div );

div.appendChild( editor.canvas );

link.innerText = 'Hello';
link.setAttribute( 'href', '#' );
link.addEventListener( 'click', e => {
	e.preventDefault();
	editor.read().then( blob => {
		console.log( 'send screenshot', blob )
		const formdata = new FormData()
		formdata.append( 'myNewFileName', blob )
		const xhr = new XMLHttpRequest();
		xhr.open( 'POST', '/upload' )
		xhr.send( formdata );
		console.log( 'sent', xhr );
	} )
} )

document.body.appendChild( link );

const readFile = file => {
	if ( ! file ) {
		return
	}

	const image = new Image();
	image.onload = () => editor.write( image );

	const reader = new FileReader();
	reader.onload = ( { target: { result } } ) => image.src = result;
	reader.readAsDataURL( file );
}

const readItem = item => {
	const blob = item.getAsFile();
	if ( ! blob ) {
		return false;
	}
	readFile( blob );
}

// copy paste
document.addEventListener( 'paste', e => {
	const { clipboardData: { items } } = e;
	if ( ! items || items.length === 0 ) {
		console.log( 'no items', e, e.originalEvent );
		return;
	}

	const [ item ] = items;

	if ( ! readItem( item ) ) {
		return;
	}

	e.preventDefault();
} );

// required for 'drop' event to work
document.addEventListener( 'dragover', e => e.preventDefault() )

document.addEventListener( 'drop', e => {
	e.preventDefault();
	const { dataTransfer: { items } } = e
	if ( !items || items.length === 0 ) {
		console.log( 'no files' );
		return;
	}
	const [ item ] = items;

	if ( ! readItem( item ) ) {
		return;
	}

	e.preventDefault();
}, false )

field.addEventListener( 'change', () => {
	readFile( field.files[0] );
} )
