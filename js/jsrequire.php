<?php

/**
 * A simple, standalone JS dependency manager
 *
 * Usage:
 * Put the following in your HTML template (example) ->
 * <script type='text/javascript' src='js/jsrequire.php'></script>
 *
 * Modify the settings below to tweak paths and caching.
 * Remember to turn caching on when not in development environment!
 */
$settings = array(
	'js_root' => 'src/',
	'caching' => false
);

// ---------------------------------------------------------------------------

// Do our magic
get_ordered_js_code($settings['js_root'], $settings['caching']);

// ---------------------------------------------------------------------------

/**
 * Our main function for doing everything
 * @param  string  $root   e.g. 'src/'
 * @param  boolean $cached
 * @return void
 */
function get_ordered_js_code($root, $cached = false)
{
	// What's our file's path?
	$compiled_file_url = 'cached.js';

	// Are we live and caching?
	if($cached === true and file_exists($compiled_file_url))
	{
		// Yup, that was fast
		be_js(file_get_contents($compiled_file_url));
		return;
	}

	// Look for our files here
	$dir = $root;

	// Get 'em (recursive)
	$files = directoryScan($dir, true, true);

	// Placeholder vars
	$parsed_files  = array();
	$loaded_files  = array();
	$js_objects    = array();
	$sorted        = array();
	$load_in_order = array();
	$js            = '';

	// Iterate our JS files
	foreach($files as $key => $i)
	{
		// Discard non-JS files
		if( ! strpos($i, '.js'))
		{
			continue;
		}

		// Read contents of file
		$code = file_get_contents($i);

		// Parse and grab this file's possible dependencies
		$dependencies = extract_dependencies($code);

		// Do some path parsing/filtering/replacing
		$remove_this  = str_replace('jsrequire.php', '', $_SERVER['SCRIPT_FILENAME']);
		$fuck_windows = str_replace('\\', '/', $i);
		$module_id    = str_replace(array($remove_this, 'assets/js/autoload/', '.js'), '', $fuck_windows);
		$module_id    = str_replace($root, '', $module_id);

		// Save our stuff for later use
		$parsed_files[$key]['path']                 = $i;
		$parsed_files[$key]['satisfies_dependency'] = $module_id;
		$parsed_files[$key]['dependencies']         = $dependencies;
		$parsed_files[$key]['code']                 = $code;

		// Create a new key for faster dependency sorting
		$js_objects[$module_id] = $dependencies;
	}

	// Make sure none of our JS files are depending on some other file
	// that doesn't exist. If that's the case, we'll break the whole process.
	foreach($js_objects as $needer => $dependencies)
	{
		foreach($dependencies as $need)
		{
			if(array_key_exists($need, $js_objects) === false)
			{
				// Ouch
				$error_message = 'JS file "' . $needer . '" needs "' . $need . '" which does not exist.';
				die("console.error('" . $error_message . "');");
			}
		}
	}

	// In what order do we need to append our JS code?
	foreach ($js_objects as $name=>$void)
	{
		$depends = depends($js_objects, $sorted, $name);

	    // Keep iterating until we're good
	    do
	    {
	        $depends = depends($js_objects,$sorted,$name);
	        $sorted[$depends] = $js_objects[$depends];
	    }
	    while ($depends != $name);
	}

	// We have our order sorted, so "merge" the sort order logic with
	// our JS file array.
	$cntr = 0;
	foreach($sorted as $key => $void)
	{
		foreach($parsed_files as $i)
		{
			if($key === $i['satisfies_dependency'])
			{
				$load_in_order[$cntr] = $i;
			}
		}
		$cntr ++;
	}

	// Now that we have a nicely sorted array with everything, append all
	// code in the correct order into our compiled JS code string.
	foreach($load_in_order as $i)
	{
		$js .= $i['code'] . "\n\n\n";
	}

	// Cache this
	file_put_contents('cached.js', $js);

	// Pretend to be JS file
	be_js($js);
	exit;
}

// ---------------------------------------------------------------------------

/**
 * Helper functions below
 */

// ---------------------------------------------------------------------------

/**
 * Logic for parsing our custom syntax
 * @param  string $code JavaScript code
 * @return array
 */
function extract_dependencies($code)
{
	$starts_with = "// requires";

	if(strpos($code, $starts_with) < 0)
	{
		return array();
	}

	$dependencies = array();

	$rows = explode("\n", $code);

	foreach($rows as $i)
	{
		if(strpos($i, $starts_with) > -1)
		{
			$bits           = explode($starts_with, $i);
			$require        = trim($bits[1]);
			$dependencies[] = $require;
		}
	}

	return $dependencies;
}

/**
 * Mimic a normal JS response
 * @param  string $js JS code to print out
 * @return void
 */
function be_js($js)
{
	header('Content-type: text/javascript');
	echo $js;
}

/**
 * Recursive algorithm for figuring out the order of dependencies.
 * This logic is stolen from the interwebs, can't remember where.
 *
 * @param  array $js_objects
 * @param  array $sorted
 * @param  string $name
 * @return string
 */
function depends($js_objects, $sorted, $name)
{
    foreach($js_objects[$name] as $item)
    {
        if( ! isset($sorted[$item]))
        	return depends($js_objects, $sorted, $item);
    }

    return $name;
}

/**
 * Scan directory recursively.
 * This whole function is also stolen from the interwebs.
 *
 * @param  string  $dir
 * @param  boolean $onlyfiles
 * @param  boolean $fullpath
 * @return array
 */
function directoryScan($dir, $onlyfiles = false, $fullpath = false)
{
	if(isset($dir) && is_readable($dir))
	{
		$dlist = Array();
		$dir   = realpath($dir);

		if($onlyfiles)
		{
			$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
		}
		else
		{
			$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir), RecursiveIteratorIterator::SELF_FIRST);
		}

		foreach($objects as $entry => $object)
		{
			if( ! $fullpath)
			{
				$entry = str_replace($dir, '', $entry);
			}

			$dlist[] = $entry;
		}

		return $dlist;
	}
}

// EOF