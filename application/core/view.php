<?php
class View {
    public function render ($template_common, $content = null, $data = null) {
        include 'application/views/'.$template_common;
    }
}
?>