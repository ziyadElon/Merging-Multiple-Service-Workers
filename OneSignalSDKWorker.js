/* 
	IMPORTANT:
	Changes made in service_worker.js.erb will not trigger an update to the service worker.
	Change the date in this comment to trigger an update to the service worker.
 	Date updated: 20th May, 2019
*/

var url = registration.scope + 'service-worker.js';

importScripts('https://cdn.onesignal.com/sdks/OneSignalSDK.js');
importScripts(url);
