export function findBootstrapEnvironment() {
    const envs = ["xs", "sm", "md", "lg"];

    const $el = $("<div>");
    $el.appendTo($("body"));

    for (let i = envs.length - 1; i >= 0; i--) {
       const env = envs[i];

       $el.addClass("hidden-" + env);
       if ($el.is(":hidden")) {
           $el.remove();
           return env;
       }
    }
    $el.remove();
    return null;
}
