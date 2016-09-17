console.log( 'welcome to a8c c&d' );

safari.application.addEventListener( 'command', event => {
	console.log( event.command );
	if ( 'mark' === event.command ) {
		console.log( 'tell the current tab to mark up a violation' );
		safari.application.activeBrowserWindow.activeTab.page.dispatchMessage( 'toggle', 'data' );
	}
}, false );

safari.application.addEventListener( 'validate', ( ... args ) => {
	console.log( 'validate', ... args );
}, false );
