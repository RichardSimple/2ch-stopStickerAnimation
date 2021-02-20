// ==UserScript==
// @name		Stop sticker animation
// @include		https://2ch.*/res/*
// @grant		none
// @version		1
// @run-at		document-idle
// ==/UserScript==

(function() {
	const canvas = document.createElement("canvas");
	const ctx2d = canvas.getContext("2d");
	const imgCache = {};
	const processImage = function(img) {try{
		if(!/\.gif$/i.test(img.src) || !/\/stickers\//i.test(img.src)) {
			return;
		}
		if(imgCache[img.src]) {
			img.src = imgCache[img.src].src;
			console.log("Обарботан стикер(кэш) ", img);
			return;
		}
		imgCache[img.src] = img;
		canvas.width = img.width;
		canvas.height = img.height;
		
		ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
		
		img.src = canvas.toDataURL("image/gif");
		console.log("Обарботан стикер ", img);
	}catch(e){
		console.warn("Обработка стикера ", img, " не удалась: ", e);
	}};
	
	new Promise(function(resolve, reject) {
		const thread = document.getElementsByClassName("thread");
		let counter = 50;
		const interval = setInterval(function() {
			if(!thread[0]) {
				if(!(--counter))
					return;
				clearInterval(interval);
				reject(new Error(".thread not found"));
			}
			else {
				clearInterval(interval);
				resolve(thread[0]);
			}
		}, 100);
	})
	.then(function(thread) {
		Array.prototype.forEach.call(thread.getElementsByClassName("post__file-preview"), processImage);
		new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {
					Array.prototype.forEach.call(node.getElementsByClassName("post__file-preview"), processImage);
				});
			});
		})
		.observe(thread, {childList: true});
	})
	.catch(function(err) {
		console.warn("Скрипт остановки автовоспроизведения гиф-стикеров не сработал: ", err);
	});
})();
