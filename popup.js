(function() {
    var devicesData;
    var desktopGadgetsPlaceholder = 'Select a Browser';
    var mobileGadgetsPlaceholder = 'Select a Device';

    $(function() {
        $('.devices__type').on('change', populateDeviceOSes);
        $('.devices__os').on('change', populateGadgets);
        $('form').submit(openBSTestingURL);

        $.ajax({
            'url': 'https://www.browserstack.com/list-of-browsers-and-platforms.json?product=live',
            'type': 'GET',
            'dataType': 'json',
            'success': function(response) {
                devicesData = response;
                populateDeviceTypes();
            }
        });
    });

    function getUserSelections() {
        var obj = {
            type: $('.devices__type').val(),
            os: $('.devices__os').val(),
            gadget: $('.devices__gadget').val()
        };
        Object.keys(obj).forEach((key) => (obj[key] === "") && delete obj[key]);
        return obj;
    }

    function populateDeviceTypes() {
        var types = Object.keys(devicesData);
        var listEle = $('.devices__type');
        populateList(types, listEle);
    }

    function populateDeviceOSes() {
        var userSelections = getUserSelections();
        var oses = devicesData[userSelections.type];
        var listEle = $('.devices__os');
        var gadgetEle = $('.devices__gadget');

        // cleanup OS and gadgets list
        cleanupList(listEle);
        cleanupList(gadgetEle);

        // set placeholder
        gadgetEle.find('option')[0].innerHTML = userSelections.type === 'desktop' ? desktopGadgetsPlaceholder : mobileGadgetsPlaceholder;

        populateList(oses, listEle, 'os_display_name', ['os', 'os_version']);
    }

    function cleanupList(list) {
        var options = list.find('[value!=""]').remove();
    }

    function populateGadgets() {
        var userSelections = getUserSelections();
        var selectedType = userSelections.type;
        var oses = devicesData[selectedType];
        var gadgetsObj = oses.find(function(e) {
            return e.os_display_name == userSelections.os;
        });
        var isDesktop = selectedType === 'desktop';
        var gadgets = isDesktop ? gadgetsObj.browsers : gadgetsObj.devices;
        var listEle = $('.devices__gadget');
        cleanupList(listEle);
        populateList(gadgets, listEle, 'display_name', isDesktop ? ['browser', 'browser_version'] : ['device', 'os_version']);
    }

    function populateList(arr, ele, field, extraFields = []) {
        $.each(arr, function(i, item) {
            var obj = {};
            extraFields.forEach(function(field) {
                obj['data-' + field] = item[field];
            });
            obj.value = field ? item[field] : item;
            obj.text = field ? item[field] : item;

            ele.append($('<option>', obj));
        });
    }

    function openBSTestingURL(url) {
        var testingURL = $('input').val();
        var defaultParams = {
            scale_to_fit: true,
            resolution: '1024x768',
            speed: 1,
            start: true,
            url: testingURL || 'www.google.com'
        }
        var url = 'https://www.browserstack.com/start#';
        var typeEle = $('.devices__type option:selected');
        var osEle = $('.devices__os option:selected');
        var gadgetEle = $('.devices__gadget option:selected');
        url += $.param(osEle.data()) + '&' + $.param(gadgetEle.data()) + '&' + $.param(defaultParams);
        chrome.tabs.create({url: url, selected: true});
    }
})();
