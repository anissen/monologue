(function ($) {
	'use strict';

	var App = {
		Bootstrap : function () {
			App.Remote = require('remote');
			App.Dialog = App.Remote.require("dialog");
			App.BrowserWindow = App.Remote.require("browser-window").getFocusedWindow();
			App.Canvas.Element = $("#canvas")[0];
			App.Canvas.Context = App.Canvas.Element.getContext("2d");
			App.File.FS = App.Remote.require('fs');

			$("#splash h2").text(greetings[Math.floor(Math.random() * greetings.length)]);

			App.Events.BindWindowControlEvents();
			App.Events.BindScrollControlEvents();
			App.Events.BindMenuControlEvents();
			App.Events.BindSplashEvents();
			App.Events.BindNodeEvents();
			App.Events.BindTreeChangeEvents();
			// App.File.StartAutosaveLoop();

			$("select", "#tool-bar").chosen();
			App.File.OpenProject("E:\\_dev\\monologue\\testproject.mpf");

			requestAnimationFrame(App.Draw.Loop);
		},
		Events : {
			BindWindowControlEvents : function () {
				var scope = "nav#menu-bar";

				$("span.close", scope).on('click', function () {
					App.BrowserWindow.close();
				});

				$("span.maximize", scope).on('click', function () {
					if (App.BrowserWindow.isMaximized()) {
						App.BrowserWindow.unmaximize();
						$(this).removeClass("maximized");
					} else {
						App.BrowserWindow.maximize();
						$(this).addClass("maximized");
					}
				});

				$("span.minimize", scope).on('click', function () {
					App.BrowserWindow.minimize();
				});
			},
			BindScrollControlEvents : function () {
				$("canvas, section#nodes, .node header").on('mousedown', function (e) {
					if ($(e.target).prop("id") === "nodes" || $(e.target).prop("id") === "canvas") {
						App.State.Dragging = true;
						$("body").addClass("dragging");

						e.preventDefault();
						e.stopPropagation();
						return false;
					} else if ($(e.target).is("header")) {
						App.State.Dragging = true;
						App.State.DraggedNode = $(e.target).closest(".node").data("id");

						e.preventDefault();
						e.stopPropagation();
						return false;
					}

				});

				$("canvas, section#nodes").on('mousemove', function (e) {
					if (($(e.target).prop("id") === "nodes" || $(e.target).prop("id") === "canvas") && App.State.DraggedNode === null) {
						if (App.State.Dragging) {
							App.State.Position.X -= App.State.LastMousePosition.X - e.clientX;
							App.State.Position.Y -= App.State.LastMousePosition.Y - e.clientY;
							App.State.Dirty = true;
						}
						
						App.State.LastMousePosition.X = e.clientX;
						App.State.LastMousePosition.Y = e.clientY;

						e.preventDefault();
						e.stopPropagation();
						return false;
					} else if ($(e.target).is("header") || App.State.DraggedNode !== null) {
						if (App.State.Dragging) {
							App.Data.Trees[App.State.CurrentTree].nodes[App.State.DraggedNode].editor.X -= App.State.LastMousePosition.X - e.clientX;
							App.Data.Trees[App.State.CurrentTree].nodes[App.State.DraggedNode].editor.Y -= App.State.LastMousePosition.Y - e.clientY;
							App.State.Dirty = true;
						}

						App.State.LastMousePosition.X = e.clientX;
						App.State.LastMousePosition.Y = e.clientY;
						App.State.Dirty = true;
						
						e.preventDefault();
						e.stopPropagation();
						return false;
					}
				});

				$("canvas, section#nodes").on('mousemove', function (e) {
					App.State.LinkMousePosition.X = e.clientX;
					App.State.LinkMousePosition.Y = e.clientY;
				})

				$("canvas, section#nodes").on('mouseup', function (e) {
						App.State.Dragging = false;
						App.State.DraggedNode = null;
						$("body").removeClass("dragging");

						e.preventDefault();
						e.stopPropagation();
						return false;
				});

				$("canvas, section#nodes, .node header").on('dblclick', function (e) {
					if ($(e.target).prop("id") === "nodes" || $(e.target).prop("id") === "canvas") {
						App.View.AddNode();
					}
				});

				$(window).on('mousewheel', function (e) {
					if (e.originalEvent.wheelDelta < 0) {
						App.State.Zoom -= App.State.Zoom * 0.05;
					} else {
						App.State.Zoom += App.State.Zoom * 0.05;
					}

					App.State.Zoom = App.State.Zoom < 0.5 ? 0.5 : App.State.Zoom > 1 ? 1 : App.State.Zoom;
					App.State.Dirty = true;
				});
			},
			BindMenuControlEvents : function () {
				var scope = "nav#tool-bar ";
				var subscope = "";

				$(".menu", scope + subscope).on('click', function () {
					$(this).toggleClass("open");
					App.View.DisplayAnimate($(".dropdown"), "shown", "open");
				});

				$(".node-menu", scope + subscope).on('click', function () {
					$(this).toggleClass("open");
					App.View.DisplayAnimate($(".node-dropdown"), "shown", "open");
				});

				var subscope = ".dropdown";
				$(".save-project", scope + subscope).on('click', function () {
					App.File.SaveProject();
					$("nav#tool-bar .menu").click();
				});

				$("select.languages").chosen().change(function () {
					App.View.ChangeLanguage($(this).find(":selected").val());
				});
			},
			BindSplashEvents : function () {
				var scope = "div#splash";
				$("span.open", scope).on('click', function (e) {
					var file = App.Dialog.showOpenDialog(App.BrowserWindow, { 
						title : "Open Project...",  
						properties: [ 'openFile' ],
						filters : [
							{ name : 'Monologue Project File', extensions: ['mpf'] }
						]
					});

					if (file !== undefined) {
						App.File.OpenProject(file[0]);
					}

					e.preventDefault();
					e.stopPropagation();
					return false;
				});
			},
			BindNodeEvents : function () {
				$("section#nodes").on('change blur', '.controls select', function () {
					if ($(this).find(":selected").val() === "placeholder") {
						$(this).addClass("placeholder");
					}
				});

				$("section#nodes").on('click', '.controls select', function () {
					$(this).removeClass("placeholder");
				});

				$('section#nodes').on('change', "select.nodetype", function () {
					var newType = $(this).find(":selected").val();
					var parent = $(this).closest(".node");

					parent.find(".controls:not(.hidden)").addClass("hidden");
					parent.find(".controls[data-type=" + newType + "]").removeClass("hidden");

					App.Data.UpdateNode(parent);
				});

				$('section#nodes').on('change', '.controls input, .controls textarea', function () {
					App.Data.UpdateNode($(this).closest(".node"));
				})

				$('section#nodes').on('focus', '.controls input, .controls textarea', function () {
					$(this).addClass("dirty");
				})

				$("section#nodes").on('click', '.links span.connectTo', function (e) {
					App.State.Link.Linking = true;
					App.State.Link.LinkingFrom = $(this).closest(".node");

					e.preventDefault();
					e.stopPropagation();
					return false;
				});

				$("section#nodes").on('mouseenter', '.links span.connectFromTrigger, .links span.connectFrom, .node', function () {
					if (App.State.Link.Linking) {
						App.State.Link.LinkTarget = $(this).closest(".node");
					}
				});

				$("section#nodes").on('mouseleave', '.links span.connectFromTrigger, .links span.connectFrom, .node', function () {
					App.State.Link.LinkTarget = null;
				});

				$("section#nodes").on('click', '.links span.connectFromTrigger, .links span.connectFrom, .node', function () {
					if (App.State.Link.Linking) {
						App.Data.AddLink(App.State.Link.LinkingFrom, App.State.Link.LinkTarget);
						App.State.Link.Linking = false;
						App.State.Link.LinkingFrom = null;
						App.State.Link.LinkTarget = null;
					}
				});
			},
			BindTreeChangeEvents : function () {
				$("select.trees").chosen().change(function () {
					var treeId = $(this).find(":selected").data('tree');

					App.State.CurrentTree = treeId;
					$('section#nodes .tree').addClass('hidden');
					$('section#nodes .tree[data-id=' + treeId + ']').removeClass('hidden');
					
					App.State.Dirty = true;
				});
			}
		},
		Draw : {
			Loop : function () {
				App.Draw.Resize();

				if (App.State.Dirty) {
					App.Draw.ScrollElements();
				}

				App.Draw.DrawLinks();
				requestAnimationFrame(App.Draw.Loop);
			},
			ScrollElements : function () {
				$("body").css({ backgroundPosition : App.State.Position.X + "px " + App.State.Position.Y + "px" });
				$("section#nodes").css({ transform : "translate(" + App.State.Position.X + "px, " + App.State.Position.Y + "px)" });
				$("section#nodes .tree").css({ transform : "scale(" + App.State.Zoom + ")" });

				if (App.Data.Trees) {
					$.each($("section#nodes .tree[data-id=" + App.State.CurrentTree + "] .node:not(.template)"), function () {
						var coords = App.Data.GetNodeCoordinates(App.State.CurrentTree, $(this).data("id"));
						$(this).css({ transform : "translate(" + coords.X + "px, " + coords.Y + "px)" });
					});
				}

				App.State.Dirty = false;
			},
			DrawLinks : function () {
				$.each($("section#nodes .tree[data-id=" + App.State.CurrentTree + "] .node:not(.template)"), function () {
					var id = $(this).data('id');
					if (App.Data.Trees[App.State.CurrentTree].nodes[id].links.length > 0) {
						var fromX, fromY, toX, toY, cp1X, cp1Y, cp2X, cp2Y,
							currentNode = $(this);

						App.Data.Trees[App.State.CurrentTree].nodes[id].links.forEach(function (link, i) {
							//TODO(romeo): support multiple links
							var fromElem = currentNode.find(".links span.connectTo:eq(" + (i - 1) + ")"),
								fromPos = fromElem.offset();

							fromX = fromPos.left;
							fromY = fromPos.top + (fromElem.outerHeight() / 2) - 35;

							var toElem = $("section#nodes .tree[data-id=" + App.State.CurrentTree + "] .node:not(.template)").filter(function () {
									return $(this).data('id') === link;
								}).find("span.connectFrom"),
								toPos = toElem.offset();

							toX = toPos.left;
							toY = toPos.top + (toElem.outerHeight() / 2) - 35;

							cp1X = fromX + (toX - fromX) / 3;
							cp2X = fromX + ((toX - fromX) / 3) * 2;
							cp1Y = fromY;
							cp2Y = toY;

							App.Canvas.Context.beginPath();
							App.Canvas.Context.moveTo(fromX, fromY);
							App.Canvas.Context.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, toX, toY);
							App.Canvas.Context.lineWidth = 3 * App.State.Zoom;
							App.Canvas.Context.strokeStyle = "#ECF0F1";
							App.Canvas.Context.stroke();
						});
					}
				});

				if (App.State.Link.Linking) {
						var fromX, fromY, toX, toY, cp1X, cp1Y, cp2X, cp2Y;

						var fromElem = App.State.Link.LinkingFrom.find(".links span.connectTo"),
							fromPos = fromElem.offset();

						fromX = fromPos.left;
						fromY = fromPos.top + (fromElem.outerHeight() / 2) - 35;

						if (App.State.Link.LinkTarget !== null) {
							var toElem = App.State.Link.LinkTarget.find("span.connectFrom"),
								toPos = toElem.offset();

							toX = toPos.left;
							toY = toPos.top + (toElem.outerHeight() / 2) - 35;
						} else {
							toX = App.State.LinkMousePosition.X;
							toY = App.State.LinkMousePosition.Y - 35;
						}

						cp1X = fromX + (toX - fromX) / 3;
						cp2X = fromX + ((toX - fromX) / 3) * 2;
						cp1Y = fromY;
						cp2Y = toY;

						App.Canvas.Context.beginPath();
						App.Canvas.Context.moveTo(fromX, fromY);
						App.Canvas.Context.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, toX, toY);
						App.Canvas.Context.lineWidth = 3 * App.State.Zoom;
						App.Canvas.Context.strokeStyle = "#ECF0F1";
						App.Canvas.Context.stroke();
				}
			},
			Resize : function () {
				var windowSize = App.BrowserWindow.getContentSize();

				App.Canvas.Element.width = App.WindowSize.Width = windowSize[0];
				App.Canvas.Element.height = App.WindowSize.Height = windowSize[1] - 35;
			}
		},
		View : {
			LoadProject : function () {
				App.View.AnimateWithCallback($("#splash .content"), "shown", function () {
					App.View.AnimateWithCallback($("#splash .icon"), "shown", function () {
						$("h1").text("Monologue - " + App.Data.Project.name);
						App.View.GenerateTrees();
						App.View.GenerateLanguages();
						App.View.GenerateNodes();
						App.State.Dirty = true;

						App.View.AnimateWithCallback($("#splash"), "shown", function () {
							$("#splash").addClass("gone");
						});
					})
				}, true);
			},
			DisplayAnimate : function (element, blockClass, opacityClass) {
				element.toggleClass(blockClass);
				setTimeout(function () {
					element.toggleClass(opacityClass);
				}, 1);
			},
			AnimateWithCallback : function (element, cssClass, callback, remove) {
				remove = remove || false;

				if (remove) {
					element.one("webkitTransitionEnd", callback).removeClass(cssClass);
				} else {
					element.one("webkitTransitionEnd", callback).addClass(cssClass);
				}
			},
			ShowStatusMessage : function (message) {
				$("#status-bar span.message").text(message);
				App.View.AnimateWithCallback($("#status-bar"), "hidden", function () {
					setTimeout(function () {
						$("#status-bar").addClass("hidden");
					}, 1000)
				}, true);
			},
			GenerateNodes : function () {
				$.each($("section#nodes .tree"), function () {
					var tree = $(this);
					App.Data.Trees[tree.data('id')].nodes.forEach(function (e, i, a) {
						var node = $(".node.template").clone().removeClass('template');
						e.type = (e.type.length > 0) ? e.type : "default";
						node.data('id', e.id);
						node.find("select.nodetype option[value=" + e.type + "]").attr("selected", "selected");
						node.find(".controls[data-type=" + e.type + "]").removeClass("hidden");

						if (e.type === "text") {
							node.find("input[data-name]").val(e.name);
							var message = App.Data.GetText(App.State.CurrentLanguage, "$T" + tree.data('id') + "N" + e.id);
							node.find("textarea[data-message]").val(message);
						}

						node.appendTo(tree);
					});
				});
			},
			GenerateTrees : function () {
				App.Data.Trees.forEach(function (tree, index) {
					var visibility = (App.State.CurrentTree == tree.id) ? "" : " hidden";
					$("section#nodes").append("<section class='tree" + visibility + "' data-id='" + tree.id + "'></section>");
					$("select.trees").append("<option data-tree='" + tree.id + "'>" + tree.displayName + "</option>");

				});

				$("select.trees").trigger("chosen:updated");
			},
			AddNode : function () {
				var node = $(".node.template").clone().removeClass('template');
				node = $(".node.template").clone().removeClass('template').data('id', App.Data.Trees[App.State.CurrentTree].nodes.length);
				node.appendTo("section#nodes .tree[data-id=" + App.State.CurrentTree + "]");
				App.Data.AddNode();
			},
			GenerateLanguages : function () {
				App.Data.Project.languages.forEach(function (language, index) {
					$('<option value="' + language.code + '">' + language.displayName + '</option>').appendTo('select.languages');
				});
				
				$('select.languages').trigger("chosen:updated");
			},
			ChangeLanguage : function (newLanguage) {
				$.each($("section#nodes .tree .node select.nodetype option[value='text']:selected"), function () {
					$(this).closest('.node').find('textarea').val(App.Data.GetText(newLanguage, "$T" + $(this).closest('.tree').data('id') + "N" + $(this).closest('.node').data('id')));
				});

				App.State.CurrentLanguage = newLanguage;
			}
		},
		Canvas : {
			Element : null,
			Context : null
		},
		WindowSize : {
			Width : 0,
			Height : 0
		},
		State : {
			Position : {
				X : 0,
				Y : 0
			},
			LastMousePosition : {
				X : 0,
				Y : 0
			},
			LinkMousePosition : {
				X : 0,
				Y : 0
			},
			Link : {
				Linking : false,
				LinkingFrom : null,
				LinkTarget : null
			},
			Zoom : 1,
			Dragging : false,
			DraggedNode : null,
			CurrentTree : 0,
			CurrentLanguage : "enUS"
		},
		File : {
			OpenProject : function (file) {
				var d = JSON.parse(App.File.FS.readFileSync(file, { encoding : "utf8"}));
				App.Data.Project = d.project;
				App.Data.Trees = d.trees;
				App.Data.Translations = d.translations;
				App.File.CurrentProjectFile = file;
				App.State.Position.X = App.Data.Project.state.position.X;
				App.State.Position.Y = App.Data.Project.state.position.Y;
				App.State.Zoom = App.Data.Project.state.zoom;
				App.State.CurrentTree = App.Data.Project.state.currentTree;

				App.View.LoadProject();
			},
			SaveProject : function (auto) {
				auto = auto || false;
				if (!App.File.Saving) {
					App.File.Saving = true;
					App.View.ShowStatusMessage((auto) ? "Auto-saving..." : "Saving...");

					$(".node input.dirty, .node textarea.dirty").trigger('change').removeClass('dirty');

					var data = { project : App.Data.Project, trees : App.Data.Trees, translations : App.Data.Translations };
					data.project.state.position.X = App.State.Position.X;
					data.project.state.position.Y = App.State.Position.Y;
					data.project.state.zoom = App.State.Zoom;
					data.project.state.currentTree = App.State.CurrentTree;

					App.File.FS.writeFileSync(App.File.CurrentProjectFile, JSON.stringify(data));
					App.File.ExportTSVs();
					
					App.File.Saving = false;
				}
			},
			StartAutosaveLoop : function () {
				setInterval(function () {
					App.File.SaveProject(true);
				}, 60000)
			},
			ExportTSVs : function () {
				var TSV = require('tsv'),
					path = App.Remote.require('path');

				App.Data.Translations.forEach(function (language) {
					var lang = Object.keys(language)[0].substr(0, 2) + "-" + Object.keys(language)[0].substr(2, 2);

					//TODO(romeo): export to the correct place (settings?)
					App.File.FS.writeFileSync(path.dirname(App.File.CurrentProjectFile) + "/" + lang + ".tsv", TSV.stringify(language[Object.keys(language)[0]]));
				});
			},
			FS : null,
			CurrentProjectFile : null,
			Saving : false
		},
		Data : {
			Project : null,
			Trees : null,
			Languages : null,
			GetNodeCoordinates : function (treeId, nodeId) {
				return {
					X : App.Data.Trees[treeId].nodes[nodeId].editor.X,
					Y : App.Data.Trees[treeId].nodes[nodeId].editor.Y
				}
			},
			AddNode : function () {
				App.Data.Trees[App.State.CurrentTree].nodes.push({
					id : App.Data.Trees[App.State.CurrentTree].nodes.length,
					links : [],
					editor : {
						X : 0,
						Y : 0
					}
				});
			},
			UpdateNode : function (nodeElement) {
				App.Data.Trees[App.State.CurrentTree].nodes[nodeElement.data('id')].type = nodeElement.find('select.nodetype option:selected').val();

				switch (App.Data.Trees[App.State.CurrentTree].nodes[nodeElement.data('id')].type) {
					case "text":
						App.Data.Trees[App.State.CurrentTree].nodes[nodeElement.data('id')].name = nodeElement.find('[data-type="text"] input[data-name]').val();
						App.Data.SetText(App.State.CurrentLanguage, "$T" + App.State.CurrentTree + "N" + nodeElement.data('id'), nodeElement.find('[data-type="text"] textarea[data-message]').val());
						break;
					case "set":
						App.Data.Trees[App.State.CurrentTree].nodes[nodeElement.data('id')].variable = nodeElement.find('[data-type="set"] select[data-variable] option:selected').val();
						App.Data.Trees[App.State.CurrentTree].nodes[nodeElement.data('id')].value = nodeElement.find('[data-type="set"] input[data-value]').val();
						break;
				}
			},
			AddLink : function (elementFrom, elementTo) {
				App.Data.Trees[App.State.CurrentTree].nodes[elementFrom.data('id')].links.push(elementTo.data('id'));
			},
			GetText : function (language, key) {
				for (var i = 0; i < App.Data.Translations.length; i++) {
					if (App.Data.Translations[i][language] !== undefined) {
						var lang = App.Data.Translations[i][language];
						for (var j = 0; j < lang.length; j++) {
							if (lang[j].flag == key) {
								return lang[j].content;
							}
						}
					}
				}
			},
			SetText : function (language, key, text) {
				for (var i = 0; i < App.Data.Translations.length; i++) {
					if (App.Data.Translations[i][language] !== undefined) {
						var lang = App.Data.Translations[i][language];
						for (var j = 0; j < lang.length; j++) {
							if (lang[j].flag == key) {
								lang[j].content = text
								return;
							} else if (lang[j].flag != key && j == lang.length - 1) {
								lang.push({
									"flag" : key,
									"content" : text
								});
							}
						}
					}
				}
			}
		},
		Remote : null,
		BrowserWindow : null,
		Dialog : null,
	};

	$(function () {
		App.Bootstrap();
		window.App = App;
	});
})(require('../js/jquery.js'));