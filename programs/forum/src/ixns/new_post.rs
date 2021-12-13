pub fn new_body(body: String) -> [u8; 140] {
    let bytes = body.as_bytes();
    let mut new_body = [0u8; 140];
    new_body[..bytes.len()].copy_from_slice(bytes);
    new_body
}
pub fn new_link(link: String) -> [u8; 88] {
    let bytes = link.as_bytes();
    let mut new_link = [0u8; 88];
    new_link[..bytes.len()].copy_from_slice(bytes);
    new_link
}
