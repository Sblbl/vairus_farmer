async function getAllStorageSyncData() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(null, (items) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items);
		})
	})
}

async function getNodes() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(null, (items) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items['nodes']);
		})
	})
}

async function getRemainder() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(null, (items) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items['remaind']);
		})
	})
}

const bg = chrome.extension.getBackgroundPage()

const port = chrome.extension.connect({
	name: 'farmNotif'
})

const main = async () => { 
	//chrome.storage.sync.clear();
	let syncData = await getAllStorageSyncData()
	bg.console.log(syncData)

	let nodes = await getNodes()

	if (nodes == undefined) {
		bg.console.log('empty')
		chrome.storage.sync.set({'nodes' : [], 'remaind' : true})	
	}

	nodes = await getNodes()

	let addSiteBtn = document.getElementById('addSiteBtn'),
		farmBtn = document.getElementById('farmBtn'),
		remBtn = document.getElementById('remainder')

	if (await getRemainder() == false) {
		bg.console.log('no_rem')
		remBtn.checked = false
	}

	addSiteBtn.addEventListener('click', async () => {
		chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
			let currentTab = tabs[0]
			bg.console.log(currentTab)
			let url = currentTab.url

			let idx = (url.search(/[^/]\/[^/]/) > 0 ? url.search(/[^/]\/[^/]/)+1 : url.length)

			url = url.slice(0, idx)

			if (url.slice(-1) == '/') {
				url  = url.slice(0, -1)
			}

			let nodes = await getNodes()

			if (nodes.indexOf(url) == -1 && url.includes('https://', 0)) {
				nodes.push(url)
				addSiteBtn.innerHTML = 'REMOVE SITE'
			} else {
				nodes.splice(nodes.indexOf(url))
				addSiteBtn.innerHTML = 'ADD THIS SITE'
			}
			chrome.storage.sync.set({'nodes' : nodes})
			nodes = await getNodes()
			bg.console.log('nodes', nodes)
		})
	})

	farmBtn.addEventListener('click', async () => {
		port.postMessage('Farm')
	})

	remBtn.addEventListener('click', async () => {
		bg.console.log('changeRemainder')
		let rem = await getRemainder()
		chrome.storage.sync.set({'remaind' : !rem})
		port.postMessage('changeRemainder')
	})
}

main()

document.addEventListener('DOMContentLoaded', async () => {
	let sheepAudio = new Audio('baa.mp3')
	let sheep = document.getElementById('sheep');
	sheep.addEventListener('click', function(){
		sheepAudio.play()
	})

	let addSiteBtn = document.getElementById('addSiteBtn')

	chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
		let currentTab = tabs[0]
		let url = currentTab.url
		let idx = (url.search(/[^/]\/[^/]/) > 0 ? url.search(/[^/]\/[^/]/)+1 : url.length)
		url = url.slice(0, idx)

		if (url.slice(-1) == '/') {
			url  = url.slice(0, -1)
		}

		let nodes = await getNodes()

		if(nodes != undefined && nodes.indexOf(url) >= 0) {
			addSiteBtn.innerHTML = 'REMOVE SITE'
		}
	})
})
