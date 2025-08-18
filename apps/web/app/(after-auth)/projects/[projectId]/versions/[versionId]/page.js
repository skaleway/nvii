"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VersionDetailsPage;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var link_1 = require("next/link");
var version_actions_1 = require("@/components/version-actions");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var sonner_1 = require("sonner");
var button_1 = require("@nvii/ui/components/button");
var card_1 = require("@nvii/ui/components/card");
var badge_1 = require("@nvii/ui/components/badge");
var scroll_area_1 = require("@nvii/ui/components/scroll-area");
var projects_provider_1 = require("@/components/projects-provider");
var session_1 = require("@/provider/session");
function VersionDetailsPage() {
  var _this = this;
  var _a = (0, navigation_1.useParams)(),
    projectId = _a.projectId,
    versionId = _a.versionId;
  var router = (0, navigation_1.useRouter)();
  var user = (0, session_1.useSession)().user;
  var _b = (0, react_1.useState)(null),
    version = _b[0],
    setVersion = _b[1];
  var _c = (0, react_1.useState)(true),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var getProjectVersion = (0, projects_provider_1.useProjects)()
    .getProjectVersion;
  (0, react_1.useEffect)(
    function () {
      var fetchVersionDetails = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var data, error_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                setIsLoading(true);
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [
                  4 /*yield*/,
                  getProjectVersion(projectId, user.id, versionId),
                ];
              case 2:
                data = _a.sent();
                setVersion(data);
                return [3 /*break*/, 5];
              case 3:
                error_1 = _a.sent();
                sonner_1.toast.error("Failed to load version details");
                console.error("Error fetching version details:", error_1);
                return [3 /*break*/, 5];
              case 4:
                setIsLoading(false);
                return [7 /*endfinally*/];
              case 5:
                return [2 /*return*/];
            }
          });
        });
      };
      fetchVersionDetails();
    },
    [projectId, versionId, getProjectVersion, user.id],
  );
  var handleRollback = function (versionId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Rolling back to version:", versionId);
        sonner_1.toast.success("Version rollback initiated");
        return [2 /*return*/];
      });
    });
  };
  var handleCreateTag = function (versionId, tagName) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Creating tag:", tagName, "for version:", versionId);
        sonner_1.toast.success('Tag "'.concat(tagName, '" created'));
        return [2 /*return*/];
      });
    });
  };
  var handleCreateBranch = function (versionId, branchName, description) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Creating branch:", branchName, "from version:", versionId);
        sonner_1.toast.success('Branch "'.concat(branchName, '" created'));
        return [2 /*return*/];
      });
    });
  };
  var handleDeleteVersion = function (versionId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Deleting version:", versionId);
        sonner_1.toast.success("Version deleted");
        router.push("/projects/".concat(projectId, "/versions"));
        return [2 /*return*/];
      });
    });
  };
  var handleExportVersion = function (versionId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Exporting version:", versionId);
        sonner_1.toast.success("Version exported");
        return [2 /*return*/];
      });
    });
  };
  var copyToClipboard = function (text) {
    navigator.clipboard.writeText(text);
    sonner_1.toast.success("Copied to clipboard");
  };
  var getChangeType = function (key) {
    if (!(version === null || version === void 0 ? void 0 : version.changes))
      return null;
    if (version.changes.added.includes(key)) return "added";
    if (version.changes.modified.includes(key)) return "modified";
    if (version.changes.deleted.includes(key)) return "deleted";
    return null;
  };
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-primary/10 rounded w-1/3" />
          <div className="h-4 bg-primary/10 rounded w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64 bg-primary/10 rounded" />
            </div>
            <div className="h-64 bg-primary/10 rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (!version) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <lucide_react_1.FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Version not found
          </h3>
          <link_1.default href={"/projects/".concat(projectId, "/versions")}>
            <button_1.Button className="mt-4">
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4" />
              Back to Versions
            </button_1.Button>
          </link_1.default>
        </div>
      </div>
    );
  }
  return (
    <div className=" mx-auto py-6 space-y-6 max-w-7xl min-h-screen">
      <div className="flex justify-between flex-col w-full">
        <div className="flex items-center justify-between w-full space-x-4">
          <link_1.default href={"/projects/".concat(projectId, "/versions")}>
            <button_1.Button variant="ghost" size="sm">
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4" />
              Back to Versions
            </button_1.Button>
          </link_1.default>

          <version_actions_1.VersionActions
            version={version}
            projectId={projectId}
            onRollback={handleRollback}
            onTag={handleCreateTag}
            onBranch={handleCreateBranch}
            onDelete={handleDeleteVersion}
            onExport={handleExportVersion}
          />
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold">
            {version.description || "Version ".concat(version.id.slice(0, 8))}
          </h1>
          {/* <p className="text-muted-foreground">
          Track and manage your environment variable versions
        </p> */}
          <div className="flex items-center space-x-2 mt-1">
            <code className="text-sm text-gray-100 px-2 py-1 rounded">
              {version.id}
            </code>
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={function () {
                return copyToClipboard(version.id);
              }}
            >
              <lucide_react_1.Copy className="h-3 w-3" />
            </button_1.Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.Code className="h-5 w-5" />
                <span>Environment Variables</span>
                <badge_1.Badge variant="outline">
                  {Object.keys(version.content).length} variables
                </badge_1.Badge>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <scroll_area_1.ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {Object.entries(version.content).map(function (_a) {
                    var key = _a[0],
                      value = _a[1];
                    var changeType = getChangeType(key);
                    return (
                      <div key={key} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <code className="font-semibold text-sm">{key}</code>
                            {changeType && (
                              <badge_1.Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {changeType}
                              </badge_1.Badge>
                            )}
                          </div>
                          <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={function () {
                              return copyToClipboard(
                                "".concat(key, "=").concat(value),
                              );
                            }}
                          >
                            <lucide_react_1.Copy className="h-3 w-3" />
                          </button_1.Button>
                        </div>
                        <div className="text-gray-50 p-2 rounded border font-mono text-sm break-all">
                          {value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </scroll_area_1.ScrollArea>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        <div className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.GitCommit className="h-5 w-5" />
                <span>Version Info</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <lucide_react_1.User className="h-4 w-4 text-muted-foreground" />
                <div className="text-white">
                  <p className="font-medium">
                    {version.user.name || version.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {version.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {(0, date_fns_1.formatDistanceToNow)(version.createdAt, {
                      addSuffix: true,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {version.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>

              {version.isCurrent && (
                <badge_1.Badge variant="default" className="w-fit">
                  Current Version
                </badge_1.Badge>
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* {version.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {version.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}
        </div>
      </div>
    </div>
  );
}
