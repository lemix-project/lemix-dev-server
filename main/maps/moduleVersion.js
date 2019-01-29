module.exports = {
    "GET":
        `SELECT
            P1.mm_identifier,
            P1.mmv_identifier,
            P1.description,
            P1.entrance,
            P1.package_time,
            P1.version_tag,
            P2.bundle_identifier,
            P2.mm_name,
            P1.author
        FROM
            mix_module_version P1
        INNER JOIN mix_module P2 ON P1.mm_identifier = P2.mm_identifier`,
    "POST": "INSERT INTO mix_module_version ( mm_identifier, mmv_identifier, description, entrance, package_time, version_tag, single_flag,author ) SELECT '#mm_identifier' mm_identifier, '#mmv_identifier' mmv_identifier, '#description' description, '#entrance' entrance, '#package_time' package_time, '#version_tag' version_tag, concat(bundle_identifier ,'^#version_tag') single_flag,'#author' author FROM mix_module WHERE mm_identifier = '#mm_identifier'",
    "PUT": "UPDATE mix_module_version SET description = '#description',entrance = '#entrance',version_tag = '#version_tag' where mmv_identifier = '#mmv_identifier'",
    "DELETE": "DELETE FROM mix_module_version where mmv_identifier = '#mmv_identifier'",
    "UPLOAD":
        `INSERT INTO mix_module_version (
            mm_identifier,
            mmv_identifier,
            description,
            entrance,
            package_time,
            version_tag,
            single_flag,
            author
        ) SELECT
            mm_identifier,
            '#mmv_identifier' mmv_identifier,
            '#description' description,
            '#entrance' entrance,
            '#package_time' package_time,
            '#version_tag' version_tag,
            '#single_flag' single_flag,
            '#author' author
        FROM
            mix_module
        WHERE
            bundle_identifier = '#bundle_identifier'
            ON DUPLICATE KEY UPDATE description = '#description',entrance='#entrance',package_time='#package_time',author='#author'`,
    "GET_ID":"select mmv_identifier from mix_module_version where single_flag='#single_flag'"
}