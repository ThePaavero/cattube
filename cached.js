/**
 * Start
 */

var TestApplication = {};

$(function()
{
	TestApplication.element = document.getElementById('test_container');
	TestApplication.element.innerHTML += '<p>Start.js is done. It requires nothing.</p>';

	TestApplication.First();
	TestApplication.Second();
	TestApplication.Third();
	TestApplication.Caca();
});

// EOF



// requires start

TestApplication.First = function() {

	TestApplication.element.innerHTML += '<p>First.js has loaded, which requires "start"</p>';

};

// EOF



// requires first

TestApplication.Third = function() {

	TestApplication.element.innerHTML += '<p>modules/module_two.js has loaded, which requires "first"</p>';

};

// EOF



// requires modules/module_two

TestApplication.Caca = function() {

	TestApplication.element.innerHTML += '<p>modules/module_caca.js has loaded, which requires "modules/module_two"</p>';

};

// EOF



// requires first

TestApplication.Second = function() {

	TestApplication.element.innerHTML += '<p>modules/module_one.js has loaded, which requires "first"</p>';

};

// EOF


